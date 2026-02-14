import { Redirect } from 'expo-router';
import '../i18n';

const Index = () => {
  const user = true;

  if (user) {
    return <Redirect href="/login" />;
  }

  return <Redirect href="/home" />;
};

export default Index;
