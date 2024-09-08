import { Label } from "@radix-ui/react-label";
import { LoaderFunctionArgs, json } from "@remix-run/cloudflare";
import { Link, useLoaderData } from "@remix-run/react";
import { QRCodeSVG } from "qrcode.react";
import { Button } from "~/components/ui/button";

export async function loader({ params, request }: LoaderFunctionArgs) {
  const key = params.key;
  if (!key) {
    throw new Response("Not Found", { status: 404 });
  }

  const url = new URL(request.url);
  const downloadUrl = `${url.protocol}//${url.host}/download/${key}`;
  return json({ downloadUrl, key });
}

export default function QRCodePage() {
  const { downloadUrl, key } = useLoaderData<typeof loader>();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white p-4">
      <div className="w-full max-w-md bg-white/10 backdrop-blur-lg rounded-lg shadow-xl p-8 space-y-6">
        <h1 className="text-2xl font-semibold text-center">共有QRコード</h1>
        <p className="text-sm text-center text-gray-300">このリンクは24時間で無効になります</p>
        <div className="bg-white p-4 rounded-lg shadow-inner">
          <QRCodeSVG
            value={downloadUrl}
            size={200}
            bgColor={"#ffffff"}
            fgColor={"#000000"}
            level={"L"}
            includeMargin={false}
            className="w-full h-auto"
          />
        </div>
        <p className="text-sm text-center text-gray-300">キー：{key}</p>
        <div className="flex justify-center">
          <Button asChild>
            <Link to={downloadUrl} target="_blank" rel="noopener noreferrer">
              ファイルをダウンロード
            </Link>
          </Button>
        </div>
        <div className="flex justify-center">
          <Label>
            <Link to="/">ホームに戻る</Link>
          </Label>
        </div>
      </div>
    </div>
  );
}