import NavBar from "@/components/Common/NavBar";
import MetaTag from "@/components/Common/SEOMetaTag";
import { ProductCategory } from "@/components/Product/ProductCategory";

const Home = () => {
  const category = ["Category1", "Category2", "Category3", "Category4", "Category5"];
  // const category = ["doll", "figure", "toy", "object", "etc"];

  return (
    <>
      <MetaTag
        title="세상에서 제일 귀여운 오픈 마켓"
        description="세상 모든 귀여운 것들이 모여있는 공간입니다. 인형부터 피규어까지, 당신의 취향을 저격할 사랑스러운 친구들이 기다리고 있으니 분양받으러 오세요!"
        url="/"
      />
      <NavBar />
      <div className="w-full flex flex-col items-center p-20">
        {category.map((cat, i) => (
          <ProductCategory category={cat} key={i} />
        ))}
      </div>
    </>
  );
};

export default Home;
