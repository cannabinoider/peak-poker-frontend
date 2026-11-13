import { notFound } from "next/navigation";

import { DesignPreview } from "@/modules/design-preview/design-preview";

/** Component preview for development only; 404 in production builds. */
const page = () => {
  if (process.env.NODE_ENV === "production") {
    notFound();
  }
  return <DesignPreview />;
};

export default page;
