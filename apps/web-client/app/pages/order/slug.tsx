import { zodResolver } from "@hookform/resolvers/zod";
import { Badge } from "@repo/ui/components/ui/badge";
import { Button } from "@repo/ui/components/ui/button";
import { Input } from "@repo/ui/components/ui/input";
import { Label } from "@repo/ui/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@repo/ui/components/ui/select";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@repo/ui/components/ui/tabs";
import { useAtom, useSetAtom } from "jotai";
import {
  CheckIcon,
  ContactIcon,
  KeyRoundIcon,
  LoaderCircleIcon,
  PackageIcon,
  ShieldCheckIcon,
  TrendingDownIcon,
  ZapIcon,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { data } from "react-router";
import z from "zod";
import Image from "~/components/image";
import { useFormMutation } from "~/hooks/use-form-mutation";
import { apiClient } from "~/utils/axios";
import { formatPrice } from "~/utils/format";
import type { Route } from "./+types/slug";
import CheckoutModal, {
  checkoutTokenAtom,
  inquiryIdAtom,
  isOpenModalCheckout,
  preCheckoutRequestDataAtom,
  preCheckoutTimeAtom,
  type PreCheckoutResponse,
} from "./checkout-modal";
import PaymentSection from "./payment-section";

export async function loader({ params }: Route.LoaderArgs) {
  try {
    const slug = params.slug;

    if (!slug) {
      throw new Response("Slug not found", { status: 404 });
    }

    const response = await apiClient.get(`/products/${slug}`);

    console.log(
      "Order slug page loaded successfully:",
      response.data.data.product_sub_categories[0],
    );

    return data({
      success: true,
      message: "Order details loaded successfully",
      data: response?.data.data,
    });
  } catch (error) {
    console.error("Error loading order slug page:", error);
    return data({
      success: false,
      message: "Failed to load order details. Please try again later.",
      data: null,
    });
  }
}

const preCheckoutSchema = z.object({
  product_id: z.string().min(1, "Product ID is required"),
  payment_method_id: z.string().min(1, "Payment method is required"),
  voucher_id: z.string().optional(),
  phone_number: z.string().optional(),
  email: z.email("Invalid email format"),
  payment_phone_number: z.string().optional(),
  input_fields: z
    .array(
      z.object({
        name: z.string().min(1, "Name is required"),
        value: z.string().min(1, "Value is required"),
      }),
    )
    .min(1, "At least one input field is required"),
});

export type PreCheckoutForm = z.infer<typeof preCheckoutSchema>;

export default function OrderSlugPage({ loaderData }: Route.ComponentProps) {
  const { data } = loaderData;

  const [preCheckoutTime, setPreCheckoutTime] = useAtom(preCheckoutTimeAtom);
  const setIsOpenModalConfirmation = useSetAtom(isOpenModalCheckout);
  const setCheckoutToken = useSetAtom(checkoutTokenAtom);
  const setInquiryId = useSetAtom(inquiryIdAtom);
  const setPreCheckoutRequestData = useSetAtom(preCheckoutRequestDataAtom);

  const form = useForm<PreCheckoutForm>({
    defaultValues: {
      product_id: data.product_sub_categories[0]?.products[0]?.id || "",
      payment_method_id: "",
      phone_number: "",
      email: "",
      payment_phone_number: "",
      input_fields:
        data.input_fields?.map((field: any) => ({
          name: field.name,
          value: "",
        })) || [],
    },
    resolver: zodResolver(preCheckoutSchema),
    mode: "onChange",
  });

  const [selectedItem, setSelectedItem] = useState<OrderProducts | null>(
    data.product_sub_categories[0]?.products[0] || null,
  );

  const { update } = useFieldArray({
    control: form.control,
    name: "input_fields",
  });

  // Update form when selectedItem changes
  useEffect(() => {
    if (selectedItem) {
      form.setValue("product_id", selectedItem.id);
    }
  }, [selectedItem, form]);

  const preCheckout = useFormMutation({
    form,
    mutationKey: [
      "preCheckout",
      data.product_sub_categories[0]?.products[0]?.id,
    ],
    mutationFn: async (formData: PreCheckoutForm) =>
      apiClient
        .post<PreCheckoutResponse>("/v2/order/inquiry", formData, {
          headers: {
            "X-Time": preCheckoutTime,
          },
        })
        .then((res) => res.data)
        .catch((err) => {
          throw err;
        }),
    onSuccess: (data) => {
      setIsOpenModalConfirmation(true);
      setCheckoutToken(data.data.checkout_token);
      setInquiryId(data.data.inquiry_id);
    },
  });

  const onSubmit = (formData: PreCheckoutForm) => {
    const { voucher_id, ...rest } = formData;

    setPreCheckoutTime(Date.now());
    if (!voucher_id) {
      setPreCheckoutRequestData(rest);
      preCheckout.mutate(rest);
    } else {
      setPreCheckoutRequestData({
        ...rest,
        voucher_id,
      });
      preCheckout.mutate({
        ...rest,
        voucher_id,
      });
    }
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <div className="w-full md:max-w-7xl mx-auto space-y-4">
        {/* <section id="banner">
          <div className="w-full overflow-hidden rounded-2xl">
            <Image
              src={loaderData.data.banner_url}
              alt="Order Banner"
              className="object-cover"
            />
          </div>
        </section> */}

        <div className="grid md:grid-cols-5 gap-6">
          <div className="md:col-span-3 space-y-4">
            <div className="flex flex-col md:flex-row items-center md:items-start text-center md:text-start gap-4 rounded-xl shadow-xs border border-gray-200 p-4 dark:border-none dark:bg-secondary text-secondary-foreground">
              <div className="w-32 rounded-lg overflow-hidden">
                <Image
                  src={loaderData.data.image_url}
                  alt=""
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1">
                <h2 className="text-lg font-semibold">{data.name}</h2>
                <p className="text-sm text-muted-foreground mt-1 text-ellipsis line-clamp-2">
                  {data.description || "No description available."}
                </p>
                <div className="flex flex-wrap gap-2 mt-4">
                  <Badge className="rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-800/30 dark:text-blue-500">
                    <ZapIcon className="w-3 h-3" />
                    Cepat
                  </Badge>
                  <Badge className="rounded-full text-xs font-medium bg-pink-100 text-pink-800 dark:bg-pink-800/30 dark:text-pink-500">
                    <PackageIcon className="w-3 h-3" />
                    Instant
                  </Badge>
                  <Badge className="rounded-full text-xs font-medium bg-teal-100 text-teal-800 dark:bg-teal-800/30 dark:text-teal-500">
                    <ShieldCheckIcon className="w-3 h-3" />
                    Aman
                  </Badge>
                  <Badge className="rounded-full text-xs font-medium bg-orange-100 text-orange-800 dark:bg-orange-800/30 dark:text-orange-500">
                    <TrendingDownIcon className="w-3 h-3" />
                    Murah
                  </Badge>
                </div>
              </div>
            </div>
            <div className="w-full h-fit rounded-xl shadow-xs border border-gray-200 p-4 dark:border-none dark:bg-secondary text-secondary-foreground">
              <div className="inline-flex gap-2 items-center">
                <div className="rounded-full p-2 bg-primary">
                  <KeyRoundIcon className="w-4 h-4" />
                </div>
                <h2 className="text-lg font-semibold">Detail Akun</h2>
              </div>
              <div className="flex gap-2 mt-4">
                {data.input_fields.map((input: any, index: number) => {
                  if (input.type == "select") {
                    return (
                      <div className="w-full" key={input.title}>
                        <Label
                          htmlFor={`input_fields.${index}.value`}
                          className="text-xs"
                        >
                          {input.title}
                        </Label>
                        <Select
                          value={form.watch(`input_fields.${index}.value`)}
                          onValueChange={(value) => {
                            update(index, { name: input.name, value });
                          }}
                        >
                          <SelectTrigger className="w-full mt-2 rounded-full dark:border-none">
                            <SelectValue placeholder={input.placeholder} />
                          </SelectTrigger>
                          <SelectContent>
                            {input.options.map((option: any) => (
                              <SelectItem
                                key={option.value}
                                value={option.value}
                              >
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {form.formState.errors.input_fields?.[index]?.value && (
                          <p className="text-red-500 text-xs mt-1">
                            {
                              form.formState.errors.input_fields[index]?.value
                                ?.message
                            }
                          </p>
                        )}
                      </div>
                    );
                  } else {
                    return (
                      <div className="w-full" key={input.title}>
                        <Label
                          htmlFor={`input_fields.${index}.value`}
                          className="text-xs"
                        >
                          {input.title}
                        </Label>
                        <Input
                          {...form.register(`input_fields.${index}.value`)}
                          type={input.type}
                          id={`input_fields.${index}.value`}
                          className="w-full mt-2 rounded-full dark:border-none"
                          placeholder={input.placeholder}
                        />
                        {form.formState.errors.input_fields?.[index]?.value && (
                          <p className="text-red-500 text-xs mt-1">
                            {
                              form.formState.errors.input_fields[index]?.value
                                ?.message
                            }
                          </p>
                        )}
                      </div>
                    );
                  }
                })}
              </div>
              <p className="text-xs underline italic font-medium mt-2">
                Bagaimana Menemukan ID?
              </p>
            </div>
            <div className="rounded-xl shadow-xs border border-gray-200 p-4 dark:border-none dark:bg-secondary text-secondary-foreground">
              <Tabs
                defaultValue={data.product_sub_categories[0]?.name ?? ""}
                className="w-full"
              >
                <TabsList>
                  {data.product_sub_categories.map((subCategory: any) => (
                    <TabsTrigger
                      key={subCategory.name}
                      value={subCategory.name}
                    >
                      {subCategory.name}
                    </TabsTrigger>
                  ))}
                </TabsList>
                {data.product_sub_categories.map((subCategory: any) => (
                  <TabsContent key={subCategory.name} value={subCategory.name}>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                      {subCategory.products.map((item: any) => (
                        <div key={item.id} className="relative pt-4 h-full">
                          {/* Label Text - Positioned above the card */}
                          {item.label_text && (
                            <div className="absolute top-0 left-0 z-20 bg-linear-to-r from-green-500 to-emerald-600 text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg">
                              {item.label_text}
                            </div>
                          )}

                          <div
                            onClick={() =>
                              item.is_available && setSelectedItem(item)
                            }
                            className={`
                      h-full group relative rounded-xl border transition-all duration-300 cursor-pointer flex flex-col
                      ${
                        selectedItem?.id === item.id
                          ? "border-primary shadow-lg shadow-primary/20 ring-2 ring-primary/20 scale-[1.02]"
                          : "border-border dark:border-foreground/20 hover:border-primary/50"
                      }
                      ${
                        !item.is_available
                          ? "opacity-60 cursor-not-allowed grayscale"
                          : "hover:scale-[1.02] hover:shadow-md"
                      }
                    `}
                          >
                            {/* Selection Indicator */}
                            {selectedItem === item.id && (
                              <div className="absolute top-2 right-2 z-20 w-6 h-6 bg-primary rounded-full flex items-center justify-center animate-in fade-in zoom-in duration-200">
                                <CheckIcon className="w-4 h-4 text-primary-foreground" />
                              </div>
                            )}

                            {/* Unavailable Overlay */}
                            {!item.is_available && (
                              <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-10 rounded-xl">
                                <span className="text-white font-semibold text-sm bg-gray-800 px-3 py-1 rounded-full">
                                  Stok Habis
                                </span>
                              </div>
                            )}

                            {/* Hover Glow Effect */}
                            <div className="absolute inset-0 bg-linear-to-r from-primary/5 via-transparent to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl" />

                            <div className="p-3">
                              <div className="flex items-center gap-2 mb-2">
                                <Image
                                  src={item.image_url}
                                  alt={item.name}
                                  className="w-8 h-8 transition-transform duration-300 group-hover:scale-110"
                                />
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-semibold text-foreground truncate">
                                    {item.name}
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    {item.sub_name}
                                  </p>
                                </div>
                              </div>

                              {/* Stock indicator */}
                              {item.stock < 200 && item.is_available && (
                                <div className="mb-2">
                                  <span className="text-xs text-orange-600 border-orange-200">
                                    <TrendingDownIcon className="inline w-3 h-3 mr-1" />
                                    Stok Menipis
                                  </span>
                                </div>
                              )}
                            </div>

                            <div className="bg-secondary/50 dark:bg-card/50 p-3 mt-auto">
                              {/* Price Section */}
                              <div className="space-y-1">
                                {item.discount > 0 && (
                                  <div className="flex items-center gap-2">
                                    <Badge
                                      variant="destructive"
                                      className="text-xs px-1 py-0"
                                    >
                                      {Math.round(
                                        (item.discount / item.price) * 100,
                                      )}
                                      %
                                    </Badge>
                                    <p className="text-xs line-through text-muted-foreground">
                                      {formatPrice(item.price)}
                                    </p>
                                  </div>
                                )}
                                <p className="font-bold text-foreground">
                                  {formatPrice(item.total_price)}
                                </p>
                              </div>
                            </div>

                            {/* Ripple Effect on Click */}
                            <div className="absolute inset-0 bg-primary/10 opacity-0 group-active:opacity-100 transition-opacity duration-150 rounded-xl" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </TabsContent>
                ))}
              </Tabs>
            </div>
          </div>
          <div className="md:col-span-2">
            <div className="space-y-4 md:sticky md:top-24 ">
              <div className="w-full h-fit rounded-xl shadow-xs border border-gray-200 p-4 dark:border-none dark:bg-secondary text-secondary-foreground">
                <div className="inline-flex gap-2 items-center">
                  <div className="rounded-full p-2 bg-primary">
                    <ContactIcon className="w-4 h-4" />
                  </div>
                  <h2 className="text-lg font-semibold">Kontak</h2>
                </div>
                <div className="w-full mt-4 mb-2">
                  <Label htmlFor="email" className="text-xs">
                    Masukkan Email
                  </Label>
                  <Input
                    {...form.register("email")}
                    type="text"
                    id="email"
                    className="w-full mt-2 rounded-full dark:border-none"
                    placeholder="user@tld.com"
                  />
                  {form.formState.errors.email && (
                    <p className="text-red-500 text-xs mt-1">
                      {form.formState.errors.email.message}
                    </p>
                  )}
                </div>

                <div className="w-full mb-2">
                  <Label htmlFor="phone_number" className="text-xs">
                    Nomor Telepon
                  </Label>
                  <Input
                    {...form.register("phone_number")}
                    type="text"
                    id="phone_number"
                    className="w-full mt-2 rounded-full dark:border-none"
                    placeholder="08123456789"
                  />
                  {form.formState.errors.phone_number && (
                    <p className="text-red-500 text-xs mt-1">
                      {form.formState.errors.phone_number.message}
                    </p>
                  )}
                </div>

                {/* Conditional payment phone number field */}
                {form.watch("payment_method_id") && (
                  <div className="w-full mb-2">
                    <Label htmlFor="payment_phone_number" className="text-xs">
                      Nomor Telepon Pembayaran (WhatsApp)
                    </Label>
                    <Input
                      {...form.register("payment_phone_number")}
                      type="text"
                      id="payment_phone_number"
                      className="w-full mt-2 rounded-full dark:border-none"
                      placeholder="628123456789"
                    />
                    {form.formState.errors.payment_phone_number && (
                      <p className="text-red-500 text-xs mt-1">
                        {form.formState.errors.payment_phone_number.message}
                      </p>
                    )}
                  </div>
                )}

                <span className="text-xs italic font-medium">
                  * Pastikan email aktif untuk menerima notifikasi
                </span>
              </div>
              <PaymentSection products={selectedItem} form={form} />

              <Button
                type="submit"
                className="w-full mt-4"
                size="lg"
                disabled={preCheckout.isPending || !form.formState.isValid}
              >
                <span className="flex items-center gap-2">
                  {preCheckout.isPending ? (
                    <LoaderCircleIcon className="w-4 h-4 animate-spin" />
                  ) : (
                    <ZapIcon className="w-4 h-4" />
                  )}
                  Pesan Sekarang
                </span>
              </Button>
            </div>
          </div>
        </div>
      </div>
      {preCheckout.isSuccess && <CheckoutModal data={preCheckout.data.data} />}
    </form>
  );
}

export type OrderProducts = {
  id: string;
  name: string;
  image_url: string;
  price: number;
  is_available: boolean;
  is_featured: boolean;
  notes: string | null;
  stock: number;
  billing_type: string;
  cut_off_start: string;
  cut_off_end: string;
  description: string;
  label_text: string | null;
  sku_code: string;
  sub_name: string;
  label_image: string | null;
  discount: number;
  total_price: number;
};
