import { redirect } from 'next/navigation';

type AdminAnalyticsDetailAliasPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function AdminAnalyticsDetailAliasPage(
  props: AdminAnalyticsDetailAliasPageProps,
) {
  const params = await props.params;
  redirect(`/admin/swot-analytics/${params.id}`);
}
