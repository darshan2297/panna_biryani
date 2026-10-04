import { Metadata } from "next";
import { siteConfig } from "@/data/siteConfig";
import { fetchStorefrontConfig } from "@/services/storefront/configService";
import { Phone, Mail, MapPin, Clock } from "lucide-react";
import { ContactForm } from "./ContactForm";

export const metadata: Metadata = {
  title: "Contact & Kitchen Location | Panna Biryani Surat",
  description:
    "Get in touch with Panna Biryani in Vesu, Surat. Contact numbers, WhatsApp support, pickup address, and operating hours for vegetarian dum biryani.",
};

export default async function ContactPage() {
  const config = await fetchStorefrontConfig();
  const pickup = {
    name: siteConfig.pickupLocation.name,
    address: config?.address_line || siteConfig.pickupLocation.address,
    area: config?.area || siteConfig.pickupLocation.area,
    city: config?.city || siteConfig.pickupLocation.city,
    pincode: config?.pincode || siteConfig.pickupLocation.pincode,
  };
  const phone = config?.phone || siteConfig.contact.phoneDisplay;
  const phoneHref = config?.phone || siteConfig.contact.phone;
  const email = config?.email || siteConfig.contact.email;
  const hours = config?.operating_hours || `${siteConfig.operatingHours.displayHours}, ${siteConfig.operatingHours.days}`;

  return (
    <div className="bg-[#faf7f2] min-h-screen pb-20">
      {/* Header */}
      <div className="bg-[#091c15] text-white py-14 px-4 sm:px-6 lg:px-8 border-b border-panna-gold/25 text-center">
        <div className="max-w-3xl mx-auto space-y-3">
          <span className="text-xs uppercase tracking-widest text-panna-gold font-bold">
            We&apos;d Love To Hear From You
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl font-black text-white">
            Contact Panna Biryani
          </h1>
          <p className="text-zinc-300 text-xs sm:text-sm max-w-xl mx-auto leading-relaxed">
            Questions about our menu, party bulk orders, or live delivery status in Surat? Reach out
            anytime.
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          {/* Left Column: Direct Contact Info (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-panna-border shadow-xs space-y-6">
              <h2 className="font-serif text-xl font-bold text-panna-deep border-b border-panna-border pb-3">
                Kitchen Information
              </h2>

              <ul className="space-y-4 text-xs sm:text-sm text-zinc-700">
                <li className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-panna-gold shrink-0 mt-0.5" />
                  <div>
                    <strong className="block text-panna-deep">Pickup Location:</strong>
                    <span className="text-zinc-600 leading-relaxed">
                      {pickup.name}
                      <br />
                      {pickup.address}, {pickup.area},{" "}
                      {pickup.city} - {pickup.pincode}
                    </span>
                  </div>
                </li>

                <li className="flex items-start gap-3">
                  <Clock className="w-5 h-5 text-panna-gold shrink-0 mt-0.5" />
                  <div>
                    <strong className="block text-panna-deep">Kitchen Hours:</strong>
                    <span className="text-zinc-600 leading-relaxed">
                      {hours}
                    </span>
                  </div>
                </li>

                <li className="flex items-start gap-3">
                  <Phone className="w-5 h-5 text-panna-gold shrink-0 mt-0.5" />
                  <div>
                    <strong className="block text-panna-deep">Phone Support:</strong>
                    <a
                      href={`tel:${phoneHref}`}
                      className="text-panna-forest font-semibold hover:underline"
                    >
                      {phone}
                    </a>
                  </div>
                </li>

                <li className="flex items-start gap-3">
                  <Mail className="w-5 h-5 text-panna-gold shrink-0 mt-0.5" />
                  <div>
                    <strong className="block text-panna-deep">Email:</strong>
                    <a
                      href={`mailto:${email}`}
                      className="text-panna-forest font-semibold hover:underline"
                    >
                      {email}
                    </a>
                  </div>
                </li>
              </ul>

              {/* Direct WhatsApp CTA */}
              <div className="pt-2">
                <a
                  href={`https://wa.me/${siteConfig.contact.whatsapp}?text=${encodeURIComponent(
                    "Hello Panna Biryani, I have a query regarding my order."
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full bg-[#25D366] hover:bg-[#20ba5a] text-white font-bold py-3 px-5 rounded-full flex items-center justify-center gap-2 text-xs uppercase tracking-wider shadow-md transition-transform active:scale-95"
                >
                  <Phone className="w-4 h-4" />
                  <span>Chat on WhatsApp</span>
                </a>
              </div>
            </div>

            {/* Delivery Areas Badge */}
            <div className="bg-[#12372a] text-white p-6 rounded-3xl border border-panna-gold/40 shadow-xs space-y-2">
              <span className="text-[10px] uppercase font-bold text-panna-gold tracking-widest">
                Doorstep Coverage
              </span>
              <h3 className="font-serif text-lg font-bold text-white">Serving Surat Neighborhoods</h3>
              <p className="text-xs text-zinc-300 leading-relaxed">
                Vesu, VIP Road, City Light, Piplod, Althan, Ghod Dod Road, Athwa Lines, Adajan, Pal,
                Nanpura, Rander, Varachha, and Katargam.
              </p>
            </div>
          </div>

          {/* Right Column: Message Form (7 cols) */}
          <div className="lg:col-span-7 bg-white p-6 sm:p-8 rounded-3xl border border-panna-border shadow-xs space-y-6">
            <div>
              <h2 className="font-serif text-2xl font-bold text-panna-deep">Send Us A Message</h2>
              <p className="text-xs text-zinc-500 mt-1">
                Have feedback or a special question? Drop us a note below.
              </p>
            </div>

            <ContactForm />
          </div>
        </div>
      </div>
    </div>
  );
}
