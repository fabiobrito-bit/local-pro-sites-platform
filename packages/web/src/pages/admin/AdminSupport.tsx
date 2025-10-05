import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';

export default function AdminSupport() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Support Tickets</h1>
      <Card>
        <CardHeader>
          <CardTitle>Alle Tickets</CardTitle>
          <CardDescription>Beheer klantenondersteuning</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Support ticketsysteem wordt binnenkort toegevoegd...</p>
        </CardContent>
      </Card>
    </div>
  );
}
