import { Redirect } from 'expo-router';
import '../i18n';

const Index = () => {
  const user = false;

  if (!user) {
    return <Redirect href="/login" />;
  }

  return <Redirect href="/home" />;
};

export default Index;
