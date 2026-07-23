import { cn } from "@/lib/utils";

type PageContainerProps = React.ComponentProps<"main">;

export function PageContainer({ className, ...props }: PageContainerProps) {
  return <main className={cn("mx-auto w-full max-w-[1440px] px-4 py-5 sm:px-6 lg:px-8 lg:py-7", className)} {...props} />;
}