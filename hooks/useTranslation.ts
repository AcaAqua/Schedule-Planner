
import { useAppContext } from '../context/AppContext';

export const useTranslation = () => {
  const { t } = useAppContext();
  return { t };
};
