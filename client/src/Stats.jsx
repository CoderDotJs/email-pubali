import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import ReactApexChart from "react-apexcharts";
import Layout from "./Layout";

const Stats = () => {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["stats"],
    queryFn: async () => {
      const res = await axios.get(import.meta.env.VITE_API_URL + "/stats");
      return res.data.data;
    },
    retry: 3,
  });

  return (
    <Layout>
      <div>
        {isError && <div className="text-center py-5">{error?.message}</div>}
        {isLoading && <div className="text-center py-5">Loading...</div>}
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
    </Layout>
  );
};

export default Stats;
