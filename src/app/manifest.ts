import { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Panna Biryani - Authentic Veg Dum Biryani Surat",
    short_name: "Panna Biryani",
    description: "Order fresh vegetarian dum biryani online in Surat with direct pickup and delivery.",
    start_url: "/",
    display: "standalone",
    background_color: "#faf7f2",
    theme_color: "#0c281e",
    icons: [
      {
        src: "/images/brand/logo.jpg",
        sizes: "192x192",
        type: "image/jpeg",
      },
      {
        src: "/images/brand/logo.jpg",
        sizes: "512x512",
        type: "image/jpeg",
      },
    ],
  };
}
