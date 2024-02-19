import { useQuery } from "@tanstack/react-query";
import Header from "./Header";
import axios from "axios";
import ReactApexChart from "react-apexcharts";

const Stats = () => {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["stats"],
    queryFn: async () => {
      const res = await axios.get(import.meta.env.VITE_API_URL + "/stats");
      return res.data.data;
    },
  });
  if (isLoading) {
    return "Loading...";
  }
  if (isError) {
    return error?.message;
  }
  return (
    <div>
      <Header />
      {data && (
        <ReactApexChart
          className="bar-chart"
          options={data}
          series={data.series}
          type="bar"
          height={450}
        />
      )}
    </div>
  );
};

export default Stats;
