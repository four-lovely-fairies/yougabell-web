import Image from "next/image";
import type { CSSProperties } from "react";

// 온보딩 가이드 각 장의 하단 비주얼. 텍스트 등장 뒤에 이어서 나타나도록 지연을 둔다.

const delay = (ms: number): CSSProperties => ({ animationDelay: `${ms}ms` });

export const MissionCardVisual = () => (
  <div
    className="w-[274px] animate-dissolve rounded-[18.8px] bg-white p-[18.8px] drop-shadow-[0_4px_20px_rgba(0,0,0,0.06)] motion-reduce:animate-none"
    style={delay(180)}
  >
    <div className="flex flex-col gap-[10px]">
      <span className="self-start rounded-full bg-gray-50 px-[7.8px] py-[3.9px] text-[9.4px] font-medium leading-[1.4] text-gray-800">
        아이 10분 가까워지기
      </span>
      <div className="flex items-center justify-between">
        <p className="text-[15.66px] font-bold leading-[1.4] tracking-[-0.31px] text-gray-800">
          아이와 눈을 마주치며
          <br />
          이야기를 해보아요
        </p>
        <Image
          src="/images/figma/guide/mission-mascot.png"
          alt=""
          width={66}
          height={47}
          className="h-[47px] w-[66px] object-cover"
        />
      </div>
      <span className="flex h-[37.6px] w-full items-center justify-center rounded-[12.5px] bg-primary-300 text-[12.5px] font-medium leading-[1.5] tracking-[-0.25px] text-white">
        미션 시작하기
      </span>
    </div>
  </div>
);

export const PhoneVisual = ({ src }: { src: string }) => (
  <Image
    src={src}
    alt=""
    width={204}
    height={322}
    priority
    className="h-full max-h-[322px] w-auto animate-dissolve object-contain object-top motion-reduce:animate-none"
    style={delay(180)}
  />
);

const ANSWERS = [
  "밥 양을 확 줄이세요. 한 숟갈도 괜찮아요.",
  "먹기 전에 10초 안아주세요",
  "아이가 그릇을 직접 고르게 해주세요.",
];

export const ChatVisual = () => (
  <div className="flex w-[292px] flex-col gap-4">
    <p
      className="animate-dissolve self-end rounded-[15.9px] rounded-tr-[3.2px] bg-primary-300 px-3 py-[10.8px] text-[13.33px] text-white motion-reduce:animate-none"
      style={delay(250)}
    >
      아이가 요즘 밥을 너무 안 먹어요 ㅠ
    </p>
    <div className="flex flex-col items-start gap-[7.3px]">
      {ANSWERS.map((answer, i) => (
        <p
          key={answer}
          className="animate-dissolve rounded-full bg-white px-3 py-[10.6px] text-[12.06px] text-gray-800 shadow-[0_2px_12px_rgba(0,0,0,0.04)] motion-reduce:animate-none"
          style={delay(650 + i * 260)}
        >
          {answer}
        </p>
      ))}
    </div>
  </div>
);
