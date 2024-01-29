import { useAuth } from "@/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Toaster } from "@/components/ui/toaster";
import { useToast } from "@/components/ui/use-toast";
import { db, storage } from "@/firebase";
import { redirectIfNotAuthorized } from "@/util/redirectIfNotAuthorized";
import { Label } from "@radix-ui/react-label";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { ImagePlus } from "lucide-react";
import { ChangeEvent, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import * as yup from "yup";

const ProductUpload = () => {
  const user = useAuth();
  redirectIfNotAuthorized(user);

  const { toast } = useToast();

  const initialVal = {
    productName: "",
    productPrice: 0,
    productQuantity: 0,
    productDescription: "",
    productCategory: "",
  };

  // 사용자 입력 값
  const [inputValues, setInputValues] = useState(initialVal);
  const { productName, productPrice, productQuantity, productDescription, productCategory } =
    inputValues;
  const [selectedFile, setSelectedFile] = useState<FileList | null>();

  const [imageList, setImageList] = useState<string[]>([]);
  const fileInput = useRef<HTMLInputElement>(null);

  // 상품 등록 버튼 disabled
  const [btnDisabled, setBtnDisabled] = useState(true);

  // 상품 등록 실패 메세지
  const [errorMsg, setErrorMsg] = useState("");

  // schema for validation
  const requiredSchema = yup.object().shape({
    productName: yup.string().required(),
    productPrice: yup.string().required(),
    productQuantity: yup.string().required(),
    productDescription: yup.string().required(),
    productCategory: yup.string().required(),
  });

  // schema for number field validation
  const numberSchema = yup.number().integer().min(1);

  useEffect(() => {
    if (
      requiredSchema.isValidSync({ ...inputValues }) &&
      imageList.length > 0 &&
      numberSchema.isValidSync(inputValues.productPrice) &&
      numberSchema.isValidSync(inputValues.productQuantity)
    ) {
      setErrorMsg("");
      setBtnDisabled(false);
    } else {
      setBtnDisabled(true);
    }
  }, [imageList, inputValues]);

  // text input onChange
  const onChange = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { value, id: inputName } = event.target;

    // Filtering non-numeric values from the number field
    let tmp = value;
    if (inputName === "productPrice" || inputName === "productQuantity") {
      if (parseInt(tmp) < 0) tmp = "0";
      if (isNaN(parseInt(tmp))) {
        tmp = tmp
          .split("")
          .filter((v) => "0123456789".includes(v))
          .join("");
      } else {
        tmp = String(parseInt(String(tmp)));
      }
      if (!tmp) tmp = "0";
    }
    setInputValues({ ...inputValues, [inputName]: tmp });
  };

  const uploadImage = (event: ChangeEvent<HTMLInputElement>) => {
    const fileList = event.target.files;
    setSelectedFile(fileList);
  };

  // image storage upload
  useEffect(() => {
    if (selectedFile) {
      const uploadPromises = Array.from(selectedFile).map((file) => {
        let fileName = file.name.split(".")[0] + new Date().getTime();
        const imageRef = ref(storage, `${user?.userId}/${fileName}`);
        return uploadBytes(imageRef, file).then(() => getDownloadURL(imageRef));
      });
      Promise.all(uploadPromises).then((downloadURLs) => setImageList(downloadURLs));
    }
  }, [selectedFile]);

  const uploadProduct = async (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    event.preventDefault();
    if (
      !(
        requiredSchema.isValidSync({ ...inputValues }) &&
        imageList.length > 0 &&
        numberSchema.isValidSync(inputValues.productPrice) &&
        numberSchema.isValidSync(inputValues.productQuantity)
      )
    ) {
      setErrorMsg("입력하지 않은 정보가 존재합니다.");
      return;
    }
    try {
      const newProduct = {
        sellerId: user?.userId,
        ...inputValues,
        productPrice: productPrice,
        productQuantity: productQuantity,
        productImage: imageList,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };
      const collectionRef = collection(db, "products");
      await addDoc(collectionRef, newProduct);
      toast({
        description: "상품이 등록되었습니다!",
      });
      setInputValues(initialVal);
      setImageList([]);
      setSelectedFile(null);
      if (fileInput.current) {
        fileInput.current.value = "";
      }
    } catch (error: unknown) {
      toast({
        variant: "destructive",
        description: "상품 등록에 실패했습니다.",
      });
    }
  };

  return (
    <div>
      <form className="flex flex-col items-center gap-5 p-20">
        <h2 className="scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight first:mt-0">
          상품 등록
        </h2>
        <div className="relative w-4/5 bg-slate-200 h-80 p-4 mt-5">
          <div className="relative flex gap-4  w-full h-full overflow-scroll">
            {imageList.length > 0 ? (
              imageList.map((img, idx) => (
                <img className="w-72 object-contain" src={img} key={idx}></img>
              ))
            ) : (
              <div className="w-full h-full flex justify-center items-center">
                <small className="text-sm font-medium text-white">이미지를 추가해주세요.</small>
              </div>
            )}
          </div>
          <div
            className="absolute right-3 bottom-3 w-fit h-fit p-2 bg-slate-500 rounded-full cursor-pointer"
            onClick={() => fileInput.current?.click()}
          >
            <ImagePlus color="#ffffff" strokeWidth={1.5} />
          </div>
        </div>
        <div className="grid w-full max-w-sm items-center gap-1.5">
          <Input
            className="hidden"
            type="file"
            multiple
            id="productImage"
            ref={fileInput}
            onChange={uploadImage}
          />
        </div>
        <div className="grid w-full max-w-sm items-center gap-1.5">
          <Label htmlFor="productName">상품 이름</Label>
          <Input
            type="text"
            id="productName"
            placeholder="product name"
            value={productName}
            onChange={onChange}
          />
        </div>
        <div className="grid w-full max-w-sm items-center gap-1.5">
          <Label htmlFor="productPrice">상품 가격</Label>
          <Input
            type="number"
            id="productPrice"
            placeholder="product price"
            value={productPrice}
            onChange={onChange}
          />
        </div>
        <div className="grid w-full max-w-sm items-center gap-1.5">
          <Label htmlFor="productQuantity">상품 수량</Label>
          <Input
            type="number"
            id="productQuantity"
            placeholder="product quantity"
            value={productQuantity}
            onChange={onChange}
          />
        </div>
        <div className="grid w-full max-w-sm items-center gap-1.5">
          <Label htmlFor="productDescription">상품 상세 설명</Label>
          <Textarea
            id="productDescription"
            placeholder="상품에 대한 상세한 설명을 입력해 주세요."
            value={productDescription}
            onChange={onChange}
          />
        </div>
        <div className="grid w-full max-w-sm items-center gap-1.5">
          <Label htmlFor="productCategory">상품 카테고리</Label>
          <Input
            type="text"
            id="productCategory"
            placeholder="product category"
            value={productCategory}
            onChange={onChange}
          />
        </div>
        <small className="text-sm font-medium text-red-400">{errorMsg}</small>
        <Button className="w-96" onClick={uploadProduct} disabled={btnDisabled}>
          상품 등록
        </Button>
        <Link to={`/products/${user?.userId}`}>👉🏻 뒤로가기</Link>
        <Toaster />
      </form>
    </div>
  );
};

export default ProductUpload;
