import ErrorScreen from "@/components/ErrorScreen";
import ListCreationForm from "@/components/ListCreationForm";
import Modal from "@/components/Modal";
import { getFriends } from "@/serverFunctions/friends/serverFunctions";

export default async function Page() {
  const { error, data } = await getFriends();

  if (error) {
    return <ErrorScreen />;
  }

  return (
    <Modal title="Création de Liste">
      <ListCreationForm friends={data} inModal={true} />
    </Modal>
  );
}
