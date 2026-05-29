import Link from "next/link";

import { Card } from "@/components/ui/card";

const sections = [
  {
    title: "服务说明",
    body: "AlphaBox 提供投研内容、交易观点和信号订阅的信息分发服务，不提供证券、期货、虚拟资产或其他金融产品的买卖执行服务。"
  },
  {
    title: "风险提示",
    body: "平台内容仅供研究和参考，不构成投资建议、收益承诺或交易指令。你应自行判断风险，并对自己的投资决策承担责任。"
  },
  {
    title: "账号责任",
    body: "你需要妥善保管账号、密码和登录凭证，不得转让、共享或允许他人冒用账号。发现异常登录或安全问题时，应及时修改密码。"
  },
  {
    title: "内容使用",
    body: "平台内文章、信号和相关资料仅限账号本人在授权范围内使用，未经许可不得复制、转发、公开传播或用于商业用途。"
  },
  {
    title: "隐私与数据",
    body: "平台会在提供登录、订阅、内容展示和管理功能所需范围内处理必要账号数据，并采取合理措施保护数据安全。"
  }
];

export default function TermsPage() {
  return (
    <main className="mx-auto min-h-[calc(100vh-4rem)] max-w-3xl px-4 py-10">
      <Card className="p-6">
        <div className="flex flex-col gap-3 border-b border-line pb-5">
          <Link className="text-sm font-medium text-mint hover:text-[#8affcc]" href="/auth/register">
            返回注册
          </Link>
          <h1 className="text-2xl font-semibold">用户协议</h1>
          <p className="text-sm leading-6 text-slate-400">
            注册并使用 AlphaBox 前，请阅读并确认以下条款。注册即表示你理解并同意本协议内容。
          </p>
        </div>
        <div className="mt-6 space-y-6">
          {sections.map((section) => (
            <section key={section.title}>
              <h2 className="text-base font-semibold text-slate-100">{section.title}</h2>
              <p className="mt-2 text-sm leading-6 text-slate-400">{section.body}</p>
            </section>
          ))}
        </div>
      </Card>
    </main>
  );
}
