import { Suspense, useId } from "react";
import { Await, Link, redirect, useLoaderData } from "react-router";
import HomeBanner from "~/components/home/banner";
import FastMenu from "~/components/home/fast-menu";
import HomeProductSections from "~/components/home/product-sections";
import { apiClient } from "~/utils/axios";
import type { Route } from "./+types";

export async function loader({}: Route.LoaderArgs) {
  try {
    const response = await apiClient.get("/home/products");

    const banners = apiClient.get("/home/banners");

    return {
      data: response.data?.data,
      banners: banners,
    };
  } catch (error) {
    return redirect("/error");
  }
}

export default function Index({ loaderData }: Route.ComponentProps) {
  const { data, banners } = useLoaderData();
  const id = useId();

  return (
    <>
      <div className="md:max-w-7xl mx-auto">
        <Suspense fallback={<div>Loading.......</div>}>
          <Await resolve={banners}>
            {(banners) => (
              <HomeBanner
                home_top={banners.data.data.home_top}
                home_middle={banners.data.data.home_middle}
                home_bottom={banners.data.data.home_bottom}
              />
            )}
          </Await>
        </Suspense>
        <FastMenu />
        <HomeProductSections />
        {data?.map((category: any) => (
          <section key={id} className="mt-14">
            <h2 className="text-xl font-semibold text-foreground capitalize">
              {category.type}
            </h2>
            <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 lg:gap-8 mt-6">
              {category.items.map((item: any) => (
                <Link to={`/order/${item.slug}`} className="h-full group">
                  <div className="overflow-hidden rounded-xl h-full flex flex-col relative transform transition-all duration-300 ease-in-out group-hover:scale-105 group-hover:shadow-2xl group-hover:-translate-y-2">
                    <div className="overflow-hidden relative">
                      <img
                        src={
                          item.image_url.startsWith("http")
                            ? item.image_url
                            : `https://is3.cloudhost.id/bagusok${item.image_url}`
                        }
                        alt=""
                        className="transition-all duration-500 object-cover w-full aspect-square group-hover:brightness-110"
                      />

                      {/* Shimmer Effect on Hover */}
                      <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-all duration-700 ease-in-out pointer-events-none" />

                      {/* Featured Badge */}
                      {item.is_featured && (
                        <div className="absolute top-2 left-2 bg-linear-to-r from-yellow-400 to-orange-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg transform transition-all duration-300 group-hover:scale-110 group-hover:rotate-3">
                          ⭐ FEATURED
                        </div>
                      )}

                      {/* Discount Label */}
                      {item.label && (
                        <div className="absolute top-2 right-2 bg-linear-to-r from-red-500 to-pink-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg animate-pulse transform transition-all duration-300 group-hover:scale-110 group-hover:-rotate-3">
                          {item.label}
                        </div>
                      )}
                    </div>

                    <div className="px-2 pt-2 pb-6 bg-secondary dark:bg-card flex-1 flex flex-col relative overflow-hidden">
                      {/* Background Gradient Animation */}
                      <div className="absolute inset-0 bg-linear-to-br from-primary/5 via-transparent to-secondary/5 opacity-0 group-hover:opacity-100 transition-all duration-500" />
                      <h3 className="font-semibold text-foreground text-ellipsis line-clamp-1 relative z-10 transition-all duration-300 group-hover:text-primary">
                        {item.name}
                      </h3>
                      <p className="text-xs text-muted-foreground mt-2 relative z-10 transition-all duration-300 group-hover:text-primary/80">
                        {item.publisher}
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        ))}
      </div>
    </>
  );
}
