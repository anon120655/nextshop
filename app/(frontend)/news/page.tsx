// app/news/page.tsx
"use client";

import { useEffect, useRef, useState } from "react";

type NewsItem = {
  NewsId: string;
  Title: string;
  CreateDate: string;
  UrlPath: string;
  NewsUpdateUploadFiles: {
    FileAddress: string;
  }[];
};

export default function NewsPage() {
  const [newsList, setNewsList] = useState<NewsItem[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false); // 👈 เพิ่ม state
  const loadingRef = useRef<HTMLDivElement>(null);
  const isFetching = useRef(false);

  useEffect(() => {
    fetchNews(page);
  }, [page]);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && hasMore) {
        setPage((prev) => prev + 1);
      }
    });

    if (loadingRef.current) observer.observe(loadingRef.current);
    return () => observer.disconnect();
  }, [hasMore]);

  const fetchNews = async (pageNum: number) => {
    if (isFetching.current) return;
    isFetching.current = true;
    setIsLoading(true); // 👈 เริ่มโหลด

    await new Promise((resolve) => setTimeout(resolve, 500)); // 👈 หน่วง 500ms

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_THA_API_URL}/api/v1/NewsUpdate/GetPaging?page=${pageNum}&pageSize=9&Status=1`
    );
    const data = await res.json();
    const items = data.Result.NewsUpdateList.Items;

    setNewsList((prev) => {
      const existingIds = new Set(prev.map((n) => n.NewsId));
      const newItems = items.filter((item) => !existingIds.has(item.NewsId));
      return [...prev, ...newItems];
    });

    if (items.length < 9) setHasMore(false);
    setIsLoading(false); // 👈 เสร็จแล้วหยุดโหลด
    isFetching.current = false;
  };

  return (
    <div className="max-w-screen-xl mx-auto p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {newsList.map((item) => (
        <a
          key={item.NewsId}
          href={item.UrlPath}
          className="border rounded-xl overflow-hidden shadow hover:shadow-lg transition duration-300"
        >
          <img
            src={item.NewsUpdateUploadFiles[0]?.FileAddress}
            alt={item.Title}
            className="w-full h-52 object-cover"
          />
          <div className="p-4">
            <div className="text-sm text-gray-500">
              {new Date(item.CreateDate).toLocaleDateString("th-TH", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </div>
            <h2 className="mt-2 font-semibold text-lg">{item.Title}</h2>
          </div>
        </a>
      ))}

      {/* 👇 จุดโหลดต่อ */}
      {hasMore && (
        <div
          ref={loadingRef}
          className="col-span-full flex justify-center py-6"
        >
          {isLoading && (
            <div className="text-gray-500 animate-pulse">กำลังโหลด...</div>
          )}
        </div>
      )}
    </div>
  );
}
