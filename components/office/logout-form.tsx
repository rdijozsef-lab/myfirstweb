import { logoutAction } from '@/app/login/actions';

export function LogoutForm() {
  return (
    <form action={logoutAction}>
      <button className="btn-secondary" type="submit">Kilépés</button>
    </form>
  );
}
