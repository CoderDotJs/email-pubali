import { useState } from "react";
import Layout from "./Layout";
import { Skeleton } from "./components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./components/ui/table";
import { read, utils } from "xlsx";
import { Input } from "./components/ui/input";

const Test = () => {
  const [data, setData] = useState([]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const handleFileChange = (e) => {
    const file = e.target.files[0];

    if (file) {
      setIsLoading(true);
      setIsError(false);
      const reader = new FileReader();

      reader.onload = (event) => {
        const data = event.target.result;
        const workbook = read(data, { type: "binary" });

        // Assuming you have only one sheet in the Excel file
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];

        // Parse sheet data into JSON format
        const jsonData = utils.sheet_to_json(sheet, { header: 1 });
        // const finalJson = jsonData
        //   .slice(1, jsonData.length)
        //   .filter((l) => l.length != 0);
        setData(
          jsonData.filter((f) => f.length === 2).slice(1, jsonData.length)
        );
        console.log(jsonData);
        // console.log(finalJson);
        setIsLoading(false);
      };

      reader.onerror = () => {
        setIsError(true);
        setError("Something went wrong!");
        setIsLoading(false);
      };

      reader.readAsBinaryString(file);
    }
  };
  return (
    <Layout>
      {" "}
      <div>
        <h5 className="text-center my-4 text-lg font-medium">
          Test excel file
        </h5>
        <div>
          {data?.length === 0 ? (
            <div className="grid w-full max-w-sm items-center gap-1.5">
              <Input
                id="file"
                type="file"
                placeholder="Select a excel file"
                accept="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
                onChange={handleFileChange}
              />
            </div>
          ) : (
            <Table>
              <TableCaption>A list of your recent emails.</TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px]">Name</TableHead>
                  <TableHead>Email</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading && (
                  <>
                    <TableRow>
                      <TableCell className="font-medium">
                        <Skeleton className="h-4 w-[250px]" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-[250px]" />
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">
                        <Skeleton className="h-4 w-[250px]" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-[250px]" />
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">
                        <Skeleton className="h-4 w-[250px]" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-[250px]" />
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">
                        <Skeleton className="h-4 w-[250px]" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-[250px]" />
                      </TableCell>
                    </TableRow>
                  </>
                )}
                {!isLoading &&
                  data?.length > 0 &&
                  data?.map((row) => {
                    return (
                      <TableRow key={row[1]}>
                        <TableCell className="font-medium">{row[0]}</TableCell>
                        <TableCell>{row[1]}</TableCell>
                      </TableRow>
                    );
                  })}

                {!isLoading && data?.length == 0 && (
                  <TableRow colSpan={2}>
                    <TableCell className="font-medium row-span-2"> </TableCell>
                    <TableCell className="font-medium row-span-2">
                      No data found!
                    </TableCell>
                  </TableRow>
                )}
                {!isLoading && isError && (
                  <TableRow colSpan={2}>
                    <TableCell className="font-medium row-span-2"> </TableCell>
                    <TableCell className="font-medium row-span-2">
                      {error?.message}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Test;
