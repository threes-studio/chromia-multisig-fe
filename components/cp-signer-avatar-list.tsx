"use client"
import {
  Avatar,
  AvatarGroup,
  UserAvatar,
} from "@/components/ui/avatar";
import {
  Tooltip,
  TooltipArrow,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface Signer {
  pubKey: string;
  name: string;
}

const CpSignerAvatarList = ({ signers = [], className = "" }: { signers: Signer[], className?: string }) => {
  return (
    <AvatarGroup className={className}>
      {
        signers.map((item, index) => (
          <TooltipProvider
            key={`avatar-group-${index}`}
            delayDuration={0}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Avatar className="ring-1 ring-background ring-offset-[2px]  ring-offset-background  h-10 w-10"
                >
                  <UserAvatar src={item.pubKey} />
                </Avatar>
              </TooltipTrigger>
              <TooltipContent>
                <p>{item.name} - {item.pubKey}</p>
                <TooltipArrow className="fill-primary" />
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ))
      }
    </AvatarGroup>
  );
};

export default CpSignerAvatarList;
