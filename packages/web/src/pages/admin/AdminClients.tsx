import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';

export default function AdminClients() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Klantenbeheer</h1>
      <Card>
        <CardHeader>
          <CardTitle>Alle Klanten</CardTitle>
          <CardDescription>Beheer klantaccounts en toegang</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Klantenbeheer wordt binnenkort toegevoegd...</p>
        </CardContent>
      </Card>
    </div>
  );
}
