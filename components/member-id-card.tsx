import Image from "next/image";
import { formatCroaCode } from "@/lib/croa";
import {
  formatMemberClass,
  formatMemberFieldLabel,
  formatMemberLevel,
  formatMemberRole,
  formatMemberStatus,
} from "@/lib/member-display";

type MemberCardData = {
  fullName: string;
  codiname: string;
  croaNumber: number;
  role: Parameters<typeof formatMemberRole>[0];
  otherRole?: string | null;
  memberClass: Parameters<typeof formatMemberClass>[0];
  level: Parameters<typeof formatMemberLevel>[0];
  status: Parameters<typeof formatMemberStatus>[0];
  photoDataUrl?: string | null;
  photoScale?: number | null;
  photoPositionX?: number | null;
  photoPositionY?: number | null;
  field?: {
    codeNumber?: number | null;
    state?: string | null;
    countryCode?: string | null;
    name?: string | null;
  } | null;
};

export function MemberIdCard({ member }: { member: MemberCardData }) {
  return (
    <article className="member-id-card member-id-card-single">
      <div className="member-id-card-seal">Credencial oficial CROA</div>

      <div className="member-id-card-header member-id-card-header-stack">
        <Image
          src="/code-airsoft-logo.jpg"
          alt="Logotipo CODE Airsoft"
          width={64}
          height={64}
          className="member-id-card-logo"
          priority
        />
        <strong className="member-id-card-brand">CROA</strong>
      </div>

      <div className="member-id-card-body member-id-card-body-stack">
        <div className="member-id-card-photo-shell">
          <div className="member-id-card-photo member-id-card-photo-round">
            <Image
              src={member.photoDataUrl || "/member-default-photo.jpeg"}
              alt={`Foto de ${member.fullName}`}
              fill
              sizes="220px"
              unoptimized
              style={{
                objectPosition: `${member.photoPositionX ?? 50}% ${member.photoPositionY ?? 50}%`,
                transform: `scale(${(member.photoScale ?? 100) / 100})`,
              }}
            />
          </div>
        </div>

        <div className="member-id-card-copy member-id-card-copy-stack">
          <div className="member-id-card-topline member-id-card-topline-stack">
            <strong>{member.codiname}</strong>
            <div className="member-id-card-croa">{formatCroaCode(member.croaNumber)}</div>
            <div className={`member-id-card-status status-${member.status}`}>
              {formatMemberStatus(member.status)}
            </div>
          </div>

          <div className="member-id-card-row">
            <div className="member-id-card-item">
              <span>Campo</span>
              <strong>{formatMemberFieldLabel(member.field)}</strong>
            </div>
            <div className="member-id-card-item">
              <span>Classe</span>
              <strong>{formatMemberClass(member.memberClass)}</strong>
            </div>
          </div>

          <div className="member-id-card-row">
            <div className="member-id-card-item">
              <span>Nível</span>
              <strong>{formatMemberLevel(member.level)}</strong>
            </div>
            <div className="member-id-card-item">
              <span>Função</span>
              <strong>{formatMemberRole(member.role, member.otherRole)}</strong>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}
