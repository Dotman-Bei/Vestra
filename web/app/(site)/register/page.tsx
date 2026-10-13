import type { Metadata } from "next";
import { RoleGate } from "@/components/shell/RoleGate";
import { RegisterForm } from "@/components/register/RegisterForm";

export const metadata: Metadata = { title: "Register an asset" };

export default function RegisterPage() {
  return (
    <div className="mx-auto max-w-[1200px] px-4 pt-10 pb-20 md:px-8 md:pt-12">
      <h1 className="text-[26px] leading-8 font-semibold tracking-[-0.015em] text-ink md:text-[32px] md:leading-[38px]">
        Register an asset
      </h1>
      <p className="mt-2 max-w-[62ch] text-[16px] leading-[26px] text-muted">
        Create a passport on BOT Chain for one piece of equipment. Everything you enter here is public and permanent.
      </p>
      <div className="mt-10">
        <RoleGate role="registrar" action="register assets">
          <RegisterForm />
        </RoleGate>
      </div>
    </div>
  );
}
