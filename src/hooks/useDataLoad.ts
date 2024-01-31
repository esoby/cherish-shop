import {
  DocumentData,
  DocumentSnapshot,
  Query,
  getDocs,
  query,
  startAfter,
} from "firebase/firestore";

// Firestore 데이터 불러오기
export const useDataLoad = <T>() => {
  const fetchData = async (
    q: Query<unknown, DocumentData>,
    pageParam: DocumentSnapshot | null
    // { pageParam = null }: QueryFunctionContext<"", DocumentSnapshot | null>
  ) => {
    if (pageParam) {
      q = query(q, startAfter(pageParam));
    }

    const querySnapshot = await getDocs(q);
    const data: T[] = [];
    querySnapshot.forEach((doc) => {
      const dataItem = doc.data() as T;
      data.push({
        ...dataItem,
        id: doc.id,
      });
    });

    return { data, lastDoc: querySnapshot.docs[querySnapshot.docs.length - 1] };
  };

  return { fetchData };
};
