"use client";

import { useEffect, useState } from "react";
import { ArrowLeft, ExternalLink, Calendar, Building2 } from "lucide-react";
import { FaCircleNotch } from "react-icons/fa";
import Link from "next/link";
import Loader from "@/components/Loader"; 
import Image from "next/image";

export default function Page() {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true); 

  useEffect(() => {
    fetch("/api/news")
      .then((res) => res.json())
      .then((data) => setNews(data.articles || []))
      .catch((err) => console.error("Error fetching news:", err))
      .finally(() => setLoading(false)); 
  }, []);

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/opus">
            <button className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors bg-gray-900 rounded-full px-6 py-2">
              <ArrowLeft className="w-5 h-5" />
              <span className="text-xl font-medium">Back</span>
            </button>
          </Link>

          <div className="text-2xl font-bold bg-gradient-to-r from-blue-400 via-blue-300 to-blue-500 bg-clip-text text-transparent flex items-center">
            <FaCircleNotch className=" text-blue-400" />
            pus Newz
          </div>

          <div className="w-20"></div> {/* Spacer for centering */}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex items-center gap-3 mb-8">
          <div className="h-10 w-1 bg-gradient-to-b from-blue-500 to-purple-500 rounded-full"></div>
          <h1 className="text-3xl font-bold">Latest News</h1>
        </div>

        {loading ? (
          <Loader /> // show your loader here
        ) : news.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {news.map((item, index) => (
              <div
                key={item.url || index}
                className="group bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl overflow-hidden border border-gray-800 hover:border-gray-700 transition-all duration-300 hover:scale-[1.02]"
              >
                {item.image && (
                  <div className="relative h-48 overflow-hidden">
                    <Image
  src={item.image}
  alt={item.title}
  width={500} // you must specify width & height
  height={300}
  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
/>
                    <div className="absolute inset-0 bg-gradient-to-t from-gray-900 to-transparent opacity-60"></div>
                  </div>
                )}

                <div className="p-5">
                  <h2 className="text-lg font-semibold mb-3 line-clamp-2 group-hover:text-blue-400 transition-colors">
                    {item.title}
                  </h2>

                  <p className="text-gray-400 text-sm mb-4 line-clamp-3">
                    {item.description || "No description available."}
                  </p>

                  <div className="flex items-center justify-between text-xs text-gray-500 pt-4 border-t border-gray-800">
                    <div className="flex items-center gap-1">
                      <Building2 className="w-3 h-3" />
                      <span>{item.source?.name || "Unknown"}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      <span>
                        {new Date(item.publishedAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                    </div>
                  </div>

                  {item.url && (
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-4 flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300 transition-colors"
                    >
                      <span>Read more</span>
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-gray-500">
            <div className="w-16 h-16 mb-4 rounded-full bg-gray-900 flex items-center justify-center">
              <Building2 className="w-8 h-8" />
            </div>
            <p className="text-lg">No news available</p>
          </div>
        )}
      </div>
    </div>
  );
}