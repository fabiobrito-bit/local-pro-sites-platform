import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';

export default function ClientAnalytics() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Analytics</h1>
      <Card>
        <CardHeader>
          <CardTitle>Website Analytics</CardTitle>
          <CardDescription>Bezoekersstatistieken en trends</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Analytics dashboard wordt binnenkort toegevoegd...</p>
        </CardContent>
      </Card>
    </div>
  );
}
