import Header from "./Header";

// eslint-disable-next-line react/prop-types
const Layout = ({ children }) => {
  return (
    <div className="">
      <Header />
      <div className="container py-10 ">{children}</div>
    </div>
  );
};

export default Layout;
