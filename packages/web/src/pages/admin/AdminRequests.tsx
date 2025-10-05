import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';

export default function AdminRequests() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Wijzigingsverzoeken</h1>
      <Card>
        <CardHeader>
          <CardTitle>Alle Verzoeken</CardTitle>
          <CardDescription>Review en goedkeuren van website wijzigingen</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Wijzigingsverzoeken dashboard wordt binnenkort toegevoegd...</p>
        </CardContent>
      </Card>
    </div>
  );
}
