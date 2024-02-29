import NavBar from "@/components/Common/NavBar";
import MetaTag from "@/components/Common/SEOMetaTag";
import { ProductCategory } from "@/components/Product/ProductCategory";
import mainImg from "@/assets/images/main.webp";

const Home = () => {
  const category = ["DOLL", "FIGURE", "TOY", "OBJECT", "ETC"];

  return (
    <>
      <MetaTag
        title="Cherish | 세상에서 제일 귀여운 오픈 마켓"
        description="세상 모든 귀여운 것들이 모여있는 공간입니다. 인형부터 피규어까지, 당신의 취향을 저격할 사랑스러운 친구들이 기다리고 있으니 분양받으러 오세요!"
        url="/"
      />
      <link rel="preload" href={mainImg} as="image" />
      <NavBar />
      <div className="w-full h-[284px] overflow-hidden relative">
        <img
          src={mainImg}
          alt="main image"
          className="w-[1080px] max-w-[1080px] absolute -bottom-24"
        />
      </div>
      <div className="w-full">
        {category.map((cat, i) => (
          <ProductCategory category={cat} key={i} />
        ))}
      </div>
    </>
  );
};

export default Home;
