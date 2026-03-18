import MemberShell from "@/components/members/MemberShell";
import ProfileForm from "./ProfileForm";

export const dynamic = "force-dynamic";

export default async function MemberProfilePage() {
  return (
    <MemberShell>
      <ProfileForm />
    </MemberShell>
  );
}
