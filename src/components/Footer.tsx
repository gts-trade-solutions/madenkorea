import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import { FaFacebookF, FaInstagram, FaYoutube, FaTiktok } from "react-icons/fa";

interface SiteSetting {
  setting_key: string;
  setting_value: string;
}

export const Footer = () => {
  const [siteSettings, setSiteSettings] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSiteSettings = async () => {
      try {
        const { data } = await supabase
          .from("site_settings")
          .select("setting_key, setting_value")
          .eq("is_active", true);

        if (data) {
          const settingsMap = data.reduce(
            (acc: Record<string, string>, setting: SiteSetting) => {
              acc[setting.setting_key] = setting.setting_value;
              return acc;
            },
            {}
          );
          setSiteSettings(settingsMap);
        }
        console.log("Fetched site settings:", data);
      } catch (error) {
        console.error("Error fetching site settings:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSiteSettings();
  }, []);

  // Footer data with CMS fallbacks
  const footerData = {
    about_title: siteSettings.footer_about_title || "ABOUT",
    about_text:
      siteSettings.footer_about_text ||
      "Made in Korea is your one-stop shop for the trendiest Asian fashion and beauty products. We offer an affordable, wide selection worldwide, plus the latest tips and secrets in beauty and styling.",
    about_korea_title:
      siteSettings.footer_about_korea_title || "ABOUT MADE IN KOREA",
    terms_conditions:
      siteSettings.footer_terms_conditions || "Terms & Conditions",
    privacy_policy: siteSettings.footer_privacy_policy || "Privacy Policy",
    address: siteSettings.footer_address || "",
    customer_care_title:
      siteSettings.footer_customer_care_title || "CUSTOMER CARE",
    faqs: siteSettings.footer_faqs || "Frequently Asked Questions (FAQs)",
    disclaimer_title: siteSettings.footer_disclaimer_title || "DISCLAIMER",
    disclaimer_text:
      siteSettings.footer_disclaimer_text ||
      "We are solely a reseller of Korean beauty products and have no involvement in their formulation or manufacturing. Responsibility lies with the original brands. Customers should review details and consult professionals if needed.",
    site_credit: siteSettings.footer_site_credit || "",
    logo_alt: siteSettings.footer_logo_alt || "Made in Korea",
    footer_logo:
      siteSettings.footer_logo ||
      siteSettings.main_logo ||
      "/lovable-uploads/908a6451-2aaf-44eb-bb13-5823b663f442.png",
  };

  if (loading) {
    return (
      <footer className="bg-black text-white">
        <div className="container mx-auto px-4 py-16">
          <div className="text-center">Loading...</div>
        </div>
      </footer>
    );
  }

  return (
    <footer
      className="mt-8 text-white"
      style={{ backgroundColor: "rgb(53, 159, 217)" }}
    >
      <div className="container mx-auto px-3 py-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* About Section */}
          <div className="space-y-2">
            <h3 className="text-base font-bold">{footerData.about_title}</h3>
            <p className="text-sm text-gray-300 leading-snug">
              {footerData.about_text}
            </p>
            <div className="pt-1">
              <p className="text-xs text-gray-400">{footerData.site_credit}</p>
            </div>
          </div>

          {/* About Made in Korea Section */}
          <div className="space-y-2">
            <h3 className="text-base font-bold">{footerData.about_korea_title}</h3>
            <ul className="space-y-1">
              <li>
                <a
                  href="/page/terms-and-conditions"
                  className="text-sm text-gray-300 hover:text-white transition-colors"
                >
                  {footerData.terms_conditions}
                </a>
              </li>
              <li>
                <a
                  href="/page/privacy-policy"
                  className="text-sm text-gray-300 hover:text-white transition-colors"
                >
                  {footerData.privacy_policy}
                </a>
              </li>
            </ul>
            <div className="pt-1">
              <p className="text-sm text-gray-300">{footerData.address}</p>
            </div>
          </div>

          {/* Customer Care Section */}
          <div className="space-y-2">
            <h3 className="text-base font-bold">
              {footerData.customer_care_title}
            </h3>
            <ul className="space-y-1">
              <li>
                <a
                  href="/page/faqs"
                  className="text-sm text-gray-300 hover:text-white transition-colors"
                >
                  {footerData.faqs}
                </a>
              </li>
            </ul>
            <div>
              <img
                src={footerData.footer_logo}
                alt={footerData.logo_alt}
                className="h-20 w-auto object-contain"
              />
              <p>Authentic Korean Products</p>
            </div>
          </div>

          {/* Disclaimer Section */}
          <div className="space-y-2">
            <h3 className="text-base font-bold">
              {footerData.disclaimer_title}
            </h3>
            <p className="text-sm text-gray-300 leading-snug">
              {footerData.disclaimer_text}
            </p>
          </div>

          {/* ✅ Social Media Section */}
          <div className="space-y-2">
            <h3 className="text-base font-bold">Follow Us</h3>
            <div className="flex space-x-3">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-300 hover:text-white transition-colors"
              >
                <FaFacebookF size={18} />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-300 hover:text-white transition-colors"
              >
                <FaInstagram size={18} />
              </a>
              <a
                href="https://youtube.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-300 hover:text-white transition-colors"
              >
                <FaYoutube size={18} />
              </a>
              <a
                href="https://tiktok.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-300 hover:text-white transition-colors"
              >
                <FaTiktok size={18} />
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
