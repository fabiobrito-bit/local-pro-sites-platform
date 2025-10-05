import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';

export default function AdminAnalytics() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Platform Analytics</h1>
      <Card>
        <CardHeader>
          <CardTitle>Analytics Overzicht</CardTitle>
          <CardDescription>Platform-brede statistieken en rapporten</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Analytics dashboard wordt binnenkort toegevoegd...</p>
        </CardContent>
      </Card>
    </div>
  );
}
