import { useAuth } from "@/context/AuthContext";
import NavBar from "@/components/Common/NavBar";
import { Order } from "@/interfaces/Order";

import { orderBy } from "firebase/firestore";
import { useState, useEffect } from "react";
import { useQuery } from "react-query";
import { redirectIfNotAuthorized } from "@/util/redirectIfNotAuthorized";
import MetaTag from "@/components/Common/SEOMetaTag";
import MainContainer from "@/components/Common/MainContainer";
import { Product } from "@/interfaces/Product";
import { fetchStoreData, fetchStoreDataByField } from "@/services/firebase/firestore";
import SaleItem from "@/components/Sale/SaleItem";

const SalesManagement = () => {
  const { user } = useAuth() || {};
  if (user) redirectIfNotAuthorized(user);
  const [productInOrderList, setProductInOrderList] = useState<Product[]>();
  const [saleStatusList, setSaleStatusList] = useState<string[]>([]);

  // 판매 내역 불러오기
  const { data: salesList } = useQuery(["orderlist"], () =>
    fetchStoreDataByField<Order>("order", "sellerId", user?.userId, [orderBy("createdAt", "desc")])
  );

  // 판매 내역별 상품 정보 불러오기 & 주문 상태 세팅
  useEffect(() => {
    if (salesList) {
      const productPromises = Array.from(salesList).map(async (sale) => {
        return await fetchStoreData<Product>("products", sale.productId);
      });
      Promise.all(productPromises).then((datas) => {
        const validProducts = datas.filter((data): data is Product => data !== null);
        setProductInOrderList(validProducts);
      });
      const newSaleStatusList = salesList.map((sale: Order) => sale.status);
      setSaleStatusList(newSaleStatusList);
    }
  }, [salesList]);

  return (
    <>
      <MetaTag
        title="판매 내역 관리"
        description="판매 내역을 관리하는 페이지입니다. 주문 정보를 조회하고 상태를 수정할 수 있습니다."
      />
      <NavBar />
      <MainContainer>
        <h2 className="border-b pb-2 text-2xl font-semibold tracking-tight">판매 관리</h2>
        <div className="w-4/5 flex flex-col gap-4">
          {salesList &&
            productInOrderList &&
            salesList.map((sale: Order, idx: number) => (
              <SaleItem
                key={idx}
                idx={idx}
                sale={sale}
                product={productInOrderList[idx]}
                saleStatusList={saleStatusList}
              />
            ))}
        </div>
      </MainContainer>
    </>
  );
};

export default SalesManagement;
