import { useState } from "react";
import { unstable_createMemoryUploadHandler, unstable_parseMultipartFormData, type ActionFunctionArgs, type MetaFunction } from "@remix-run/cloudflare";
import { Form, redirect, useSubmit } from "@remix-run/react";
import { uuid } from "@cfworker/uuid";
import { LoaderCircle, Upload } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";

export const meta: MetaFunction = () => {
  return [
    { title: "QRコード共有" },
    {
      name: "description",
      content: "画像ファイルをアップロードしてQRコードを生成します",
    },
  ];
};

export async function action({ request, context }: ActionFunctionArgs) {
  const uploadHandler = unstable_createMemoryUploadHandler({ maxPartSize: 1024 * 1024 * 10, });
  const formData = await unstable_parseMultipartFormData(request, uploadHandler);
  const file = formData.get("file") as File;

  const key = `${uuid()}.${file.type.split("/")[1]}`;

  const response = await context.cloudflare.env.MY_BUCKET.put(key, await file.arrayBuffer(), {
    httpMetadata: { contentType: file.type }
  });

  console.log(response);

  return redirect(`/qrcode/${key}`);
}

export default function Index() {
  const submit = useSubmit();
  const [fileName, setFileName] = useState("")
  const [isLoading, setIsLoading] = useState(false);

  return (
    <div className="min-h-screen w-full bg-white flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <h1 className="text-3xl font-light text-gray-800 mb-8 text-center">
          QRコード共有
        </h1>
        <Form method="post" encType="multipart/form-data" className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="file" className="flex flex-col">
              <span className="text-sm font-medium text-gray-600">
                ファイルをアップロード
              </span>
              <span className="text-xs text-gray-400">
                最大10MBまでの画像ファイルをアップロードできます
              </span>
            </Label>
            <div className="relative">
              <Input
                id="file"
                name="file"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => setFileName(e.target.files?.[0]?.name || "")}
              />
              <Label
                htmlFor="file"
                className="flex items-center justify-center w-full p-3 border border-gray-300 rounded-md cursor-pointer hover:border-gray-400 transition-colors"
              >
                <Upload className="w-5 h-5 text-gray-400 mr-2" />
                <span className="text-sm text-gray-600 truncate">
                  {fileName || "ファイルを選択"}
                </span>
              </Label>
            </div>
          </div>
          <Button
            type="submit"
            disabled={!fileName || isLoading}
            className="w-full bg-black hover:bg-gray-800 text-white font-medium py-2 px-4 rounded-md transition-all duration-200"
            onClick={(event) => {
              setIsLoading(true)
              submit(event.currentTarget)
            }}
          >
            QRコードを生成
            {isLoading && (
              <LoaderCircle className="w-5 h-5 ml-3 animate-spin text-white" />
            )}
          </Button>
        </Form>
      </div >
    </div >
  );
}
