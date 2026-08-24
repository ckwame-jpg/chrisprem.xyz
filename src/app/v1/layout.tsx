import "@/styles/v1/theme.css";
import ThemeProvider from "@/components/v1/ThemeProvider";

export const metadata = {
  title: "chris prempeh - portfolio v1",
  description: "the previous version of chrisprem.xyz. backend developer focused on secure, scalable systems.",
};

export default function V1Layout({ children }: { children: React.ReactNode }) {
  return <ThemeProvider>{children}</ThemeProvider>;
}
