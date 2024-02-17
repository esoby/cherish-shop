import NavBar from "@/components/Common/NavBar";
import { ProductCategory } from "@/components/Product/ProductCategory";

const Home = () => {
  const category = ["Category1", "Category2", "Category3", "Category4", "Category5"];

  return (
    <>
      <NavBar />
      <div className="w-full flex flex-col items-center p-20 mt-16">
        {category.map((cat, i) => (
          <ProductCategory category={cat} key={i} />
        ))}
      </div>
    </>
  );
};

export default Home;
