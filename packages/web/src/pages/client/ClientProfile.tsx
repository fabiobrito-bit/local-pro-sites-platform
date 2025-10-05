import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';

export default function ClientProfile() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Profiel</h1>
      <Card>
        <CardHeader>
          <CardTitle>Profielinstellingen</CardTitle>
          <CardDescription>Beheer je account en voorkeuren</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Profielinstellingen worden binnenkort toegevoegd...</p>
        </CardContent>
      </Card>
    </div>
  );
}
