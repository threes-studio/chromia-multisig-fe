"use client";
import {
  Avatar,
  AvatarFallback,
  UserAvatar,
} from "@/components/ui/avatar";
import {
  Timeline,
  TimelineItem,
  TimelineContent,
  TimelineDot,
  TimelineConnector,
  TimelineSeparator,
} from "@/components/ui/timeline";
import { Transaction } from "@/config/api/transactions/types";

const TransactionTimeLine = ({ logs }: { logs: Transaction["logs"] }) => {
  return (
    <div className="max-w-[600px]">
      <Timeline gap>
        {logs.map((log, index) => (
          <TimelineItem key={log.id}>
            <TimelineSeparator>
              <TimelineDot
                color={
                  log.action === "executed"
                    ? "success"
                    : log.action === "signed"
                      ? "info"
                      : "default"
                }
                className={index === logs.length - 1 ? "animate-bounce" : ""}
              />
              {index < logs.length - 1 && <TimelineConnector />}
            </TimelineSeparator>
            <TimelineContent>
              <div className="flex flex-col sm:flex-row gap-2">
                <Avatar className="ring-1 ring-background ring-offset-[2px] ring-offset-background h-9 w-9">
                  <UserAvatar src={log.pubKey} />
                </Avatar>
                <div>
                  <span className="text-sm text-default-500 block">
                    {log.signerName} {log.action}
                  </span>
                  <span className="text-xs text-default-500 block">
                    {new Date(log.createdAt).toLocaleString()}
                  </span>
                </div>
              </div>
            </TimelineContent>
          </TimelineItem>
        ))}
      </Timeline>
    </div>
  );
};

export default TransactionTimeLine;
