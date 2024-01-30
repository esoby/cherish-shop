import { useAuth } from "@/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Toaster } from "@/components/ui/toaster";
import { useToast } from "@/components/ui/use-toast";

import { db, storage } from "@/firebase";
import { Product } from "@/interfaces/Product";
import { redirectIfNotAuthorized } from "@/util/redirectIfNotAuthorized";
import { Label } from "@radix-ui/react-label";
import { serverTimestamp, doc, getDoc, updateDoc, deleteDoc } from "firebase/firestore";
import { deleteObject, getDownloadURL, getStorage, ref, uploadBytes } from "firebase/storage";
import { ChangeEvent, useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import * as yup from "yup";
import { ImagePlus } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const ProductUpdate = () => {
  const user = useAuth();
  redirectIfNotAuthorized(user);
  const { pid } = useParams();
  const navigate = useNavigate();

  const { toast } = useToast();

  const initialVal = {
    productName: "",
    productPrice: 0,
    productQuantity: 0,
    productDescription: "",
  };

  // 사용자 입력 값
  const [inputValues, setInputValues] = useState(initialVal);
  const { productName, productPrice, productQuantity, productDescription } = inputValues;
  const [productCategory, setProductCategory] = useState("");
  const [selectedFile, setSelectedFile] = useState<FileList | null>();

  const [imageUrlList, setImageUrlList] = useState<string[]>([]);
  const fileInput = useRef<HTMLInputElement>(null);

  // 상품 수정 버튼 disabled
  const [btnDisabled, setBtnDisabled] = useState(true);

  // 상품 수정 실패 메세지
  const [errorMsg, setErrorMsg] = useState("");

  // schema for validation
  const requiredSchema = yup.object().shape({
    productName: yup.string().required(),
    productPrice: yup.string().required(),
    productQuantity: yup.string().required(),
    productDescription: yup.string().required(),
    productCategory: yup.string().required(),
  });

  const categorySchema = yup.string().required();

  // schema for number field validation
  const numberSchema = yup.number().integer().min(1);

  // 수정 버튼 disabled 스위치
  useEffect(() => {
    if (
      requiredSchema.isValidSync({ ...inputValues }) &&
      imageUrlList.length > 0 &&
      numberSchema.isValidSync(inputValues.productPrice) &&
      numberSchema.isValidSync(inputValues.productQuantity) &&
      categorySchema.isValidSync(productCategory)
    ) {
      setErrorMsg("");
      setBtnDisabled(false);
    } else {
      setBtnDisabled(true);
    }
  }, [imageUrlList, inputValues]);

  // fetch current product data
  useEffect(() => {
    const fetchData = async () => {
      if (pid) {
        const docRef = doc(db, "products", pid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data() as Product;
          setInputValues({
            ...data,
          });
          setImageUrlList([...data.productImage]);
          setProductCategory(data.productCategory);
        }
      }
    };
    fetchData();
  }, []);

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
      if (imageUrlList.length) {
        // 기존 이미지 파일 삭제
        const storage = getStorage();
        imageUrlList.forEach((imgUrl) => {
          let decodedFilePath = decodeURIComponent(imgUrl.split("/o/")[1].split("?")[0]);
          let fileRef = ref(storage, decodedFilePath);
          deleteObject(fileRef)
            .then(() => {})
            .catch((error) => {});
        });
      }
      const uploadPromises = Array.from(selectedFile).map((file) => {
        let fileName = file.name.split(".")[0] + new Date().getTime();
        const imageRef = ref(storage, `${user?.userId}/${fileName}`);
        return uploadBytes(imageRef, file).then(() => getDownloadURL(imageRef));
      });
      Promise.all(uploadPromises).then((downloadURLs) => setImageUrlList(downloadURLs));
    }
  }, [selectedFile]);

  // 상품 수정
  const updateProduct = async (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    event.preventDefault();
    // data validation
    if (
      !(
        requiredSchema.isValidSync({ ...inputValues }) &&
        imageUrlList.length > 0 &&
        numberSchema.isValidSync(inputValues.productPrice) &&
        numberSchema.isValidSync(inputValues.productQuantity) &&
        categorySchema.isValidSync(productCategory)
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
        productImage: imageUrlList,
        updatedAt: serverTimestamp(),
      };
      if (pid) {
        const docRef = doc(db, "products", pid);
        await updateDoc(docRef, newProduct);
        toast({
          description: "상품 정보가 수정되었습니다!",
        });
      }
    } catch (error: unknown) {
      toast({
        variant: "destructive",
        description: "상품 정보 수정에 실패했습니다.",
      });
    }
  };

  // 상품 삭제
  const deleteProduct = async (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    event.preventDefault();

    if (pid) {
      const docRef = doc(db, "products", pid);
      await deleteDoc(docRef);
      toast({
        variant: "destructive",
        description: "상품 정보가 삭제되었습니다.",
      });
      setTimeout(() => navigate(`/products/${user?.userId}`), 1500);
    }
  };

  return (
    <div>
      <Link to={`/products/${user?.userId}`}>👉🏻 뒤로가기</Link>
      <form className="flex flex-col items-center gap-5 p-20">
        <h2 className="scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight first:mt-0">
          상품 수정
        </h2>
        <div className="relative flex gap-4 bg-slate-200 w-4/5 h-80 overflow-scroll p-4 mt-5">
          {imageUrlList.length > 0 ? (
            imageUrlList.map((img, idx) => (
              <img className="w-72 object-contain" src={img} key={idx}></img>
            ))
          ) : (
            <div className="w-full h-full flex justify-center items-center">
              <small className="text-sm font-medium text-white">이미지를 추가해주세요.</small>
            </div>
          )}
          <div
            className="absolute right-2 bottom-2 w-fit h-fit p-2 bg-slate-500 rounded-full cursor-pointer"
            onClick={() => fileInput.current?.click()}
          >
            <ImagePlus color="#ffffff" strokeWidth={1.5} />
          </div>
        </div>
        <Input
          className="hidden"
          type="file"
          multiple
          name="productImage"
          ref={fileInput}
          onChange={uploadImage}
        />
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
          <Label htmlFor="productCategory">상품 카테고리</Label>
          <Select value={productCategory} onValueChange={(value) => setProductCategory(value)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="선택" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Category1">Category1</SelectItem>
              <SelectItem value="Category2">Category2</SelectItem>
              <SelectItem value="Category3">Category3</SelectItem>
              <SelectItem value="Category4">Category4</SelectItem>
              <SelectItem value="Category5">Category5</SelectItem>
            </SelectContent>
          </Select>
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
        <small className="text-sm font-medium text-red-400">{errorMsg}</small>
        <div className="flex gap-2">
          <Button className="w-48" onClick={updateProduct} disabled={btnDisabled}>
            상품 수정
          </Button>
          <Button
            variant="destructive"
            className="w-48"
            onClick={deleteProduct}
            disabled={btnDisabled}
          >
            상품 삭제
          </Button>
        </div>
        <Toaster />
      </form>
    </div>
  );
};

export default ProductUpdate;
