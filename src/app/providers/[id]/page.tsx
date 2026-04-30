export const dynamic = "force-dynamic";

import { createClient } from "@/lib/supabase/server";
import { CATEGORY_LABELS, type ServiceCategory } from "@/lib/types";
import { notFound } from "next/navigation";
import { Phone, Mail, Globe, MapPin, Star, Eye } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { Provider } from "@/lib/types";

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { id } = await params;
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("providers")
      .select("full_name, category")
      .eq("id", id)
      .eq("approval_status", "approved")
      .single();
    if (!data) return { title: "Szolgáltató" };
    const label = CATEGORY_LABELS[data.category as ServiceCategory];
    return { title: `${data.full_name} – ${label} | Esküvőre Készülök` };
  } catch {
    return { title: "Szolgáltató" };
  }
}

export default async function ProviderProfilePage({ params }: PageProps) {
  const { id } = await params;

  let provider: Provider | null = null;
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("providers")
      .select("*")
      .eq("id", id)
      .eq("approval_status", "approved")
      .single();
    if (error || !data) notFound();
    provider = data as Provider;
  } catch {
    notFound();
  }

  if (!provider) notFound();

  const rating = provider.average_rating ?? 0;
  const reviewCount = provider.review_count ?? 0;
  const viewCount = provider.view_count ?? 0;
  const categoryLabel =
    CATEGORY_LABELS[provider.category as ServiceCategory] ?? provider.category;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Breadcrumb */}
      <nav className="text-lg text-gray-900 mb-8">
        <a href="/services" className="hover:text-[#2a9d8f] cursor-pointer">
          Szolgáltatások
        </a>{" "}
        /{" "}
        <a
          href={`/services/${provider.category}`}
          className="hover:text-[#2a9d8f] cursor-pointer"
        >
          {categoryLabel}
        </a>{" "}
        / <span className="text-gray-900">{provider.full_name}</span>
      </nav>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        {/* Hero section */}
        <div className="bg-gradient-to-br from-[#2a9d8f]/10 to-[#C04C9B]/10 px-8 py-10 flex flex-col sm:flex-row gap-6 items-center sm:items-start">
          {/* Avatar */}
          <div className="w-28 h-28 rounded-full overflow-hidden border-4 border-white shadow-md bg-gray-100 flex items-center justify-center shrink-0">
            {provider.avatar_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={provider.avatar_url}
                alt={provider.full_name}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-4xl font-bold text-gray-900">
                {provider.full_name.charAt(0)}
              </span>
            )}
          </div>

          {/* Name & meta */}
          <div className="flex-1 text-center sm:text-left">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
              {provider.full_name}
            </h1>

            <div className="flex flex-wrap gap-2 justify-center sm:justify-start mb-3">
              <Badge variant="secondary" className="text-lg">
                {categoryLabel}
              </Badge>
              <span className="flex items-center gap-1 text-lg text-gray-900">
                <MapPin className="h-4 w-4" />
                {provider.county}
              </span>
            </div>

            {/* Rating row */}
            <div className="flex items-center gap-2 justify-center sm:justify-start">
              <div className="flex items-center gap-0.5">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={cn(
                      "h-5 w-5",
                      star <= Math.round(rating)
                        ? "fill-amber-400 text-amber-400"
                        : "fill-gray-200 text-gray-200"
                    )}
                  />
                ))}
              </div>
              <span className="font-semibold text-gray-900">
                {rating > 0 ? rating.toFixed(1) : "–"}
              </span>
              {reviewCount > 0 && (
                <span className="text-lg text-gray-900">
                  ({reviewCount} értékelés)
                </span>
              )}
              <span className="ml-4 flex items-center gap-1 text-lg text-gray-900">
                <Eye className="h-4 w-4" />
                {viewCount} megtekintés
              </span>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="px-8 py-8 grid md:grid-cols-5 gap-8">
          {/* Left: description + gallery */}
          <div className="md:col-span-3 space-y-6">
            {provider.description && (
              <section>
                <h2 className="text-lg font-semibold text-gray-900 mb-3">
                  Bemutatkozás
                </h2>
                <p className="text-gray-900 leading-relaxed whitespace-pre-line">
                  {provider.description}
                </p>
              </section>
            )}

            {provider.gallery_urls && provider.gallery_urls.length > 0 && (
              <section>
                <h2 className="text-lg font-semibold text-gray-900 mb-3">
                  Galéria
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {provider.gallery_urls.map((url, i) => (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      key={i}
                      src={url}
                      alt={`Galéria ${i + 1}`}
                      className="w-full h-40 object-cover rounded-lg border border-gray-200"
                    />
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* Right: contact card */}
          <div className="md:col-span-2">
            <div className="bg-gray-50 rounded-xl border border-gray-200 p-5 space-y-4 sticky top-24">
              <h2 className="text-base font-semibold text-gray-900">
                Elérhetőség
              </h2>

              <div className="space-y-3">
                <ContactItem
                  icon={<Phone className="h-4 w-4 text-[#2a9d8f]" />}
                  label="Telefon"
                  value={provider.phone}
                  href={`tel:${provider.phone}`}
                />
                <ContactItem
                  icon={<Mail className="h-4 w-4 text-[#2a9d8f]" />}
                  label="E-mail"
                  value={provider.email}
                  href={`mailto:${provider.email}`}
                />
                {provider.website && (
                  <ContactItem
                    icon={<Globe className="h-4 w-4 text-[#2a9d8f]" />}
                    label="Weboldal"
                    value={provider.website}
                    href={
                      provider.website.startsWith("http")
                        ? provider.website
                        : `https://${provider.website}`
                    }
                    external
                  />
                )}
              </div>

              <a
                href={`mailto:${provider.email}`}
                className="block w-full text-center bg-[#C04C9B] hover:bg-[#a33d83] text-white font-semibold py-2.5 rounded-lg transition-colors cursor-pointer mt-2"
              >
                Kapcsolatfelvétel
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ContactItem({
  icon,
  value,
  href,
  external = false,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  href: string;
  external?: boolean;
}) {
  return (
    <div className="flex gap-3 items-center">
      <span className="shrink-0">{icon}</span>
      <a
        href={href}
        target={external ? "_blank" : undefined}
        rel={external ? "noopener noreferrer" : undefined}
        className="text-base text-gray-900 hover:text-[#2a9d8f] break-all cursor-pointer"
      >
        {value}
      </a>
    </div>
  );
}
