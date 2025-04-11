import DashBoardLayoutProvider from "@/provider/dashboard.layout.provider";

const layout = async ({ children }: { children: React.ReactNode }) => {
  return (
    <DashBoardLayoutProvider>{children}</DashBoardLayoutProvider>
  );
};

export default layout;
