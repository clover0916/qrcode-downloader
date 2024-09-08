import { LoaderFunctionArgs } from "@remix-run/cloudflare";

export async function loader({ params, context }: LoaderFunctionArgs) {
  const key = params.key;
  if (!key) {
    throw new Response("Not Found", { status: 404 });
  }

  const object = await context.cloudflare.env.MY_BUCKET.get(key);

  if (!object) {
    throw new Response("Not Found", { status: 404 });
  }

  return new Response(object.body, {
    headers: {
      "Content-Type": object.httpMetadata?.contentType || "application/octet-stream",
      "Content-Disposition": `attachment; filename="${key.split('-').slice(1).join('-')}"`,
    },
  });
}