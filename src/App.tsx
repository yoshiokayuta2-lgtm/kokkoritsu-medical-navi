"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { studentRealities } from "./studentRealities";
import { medicalColumns, type MedicalColumn } from "./medicalColumns";

type Axis = "研究" | "臨床" | "地域医療" | "国際性";
type ExamFilter = "すべて" | "後期あり" | "推薦・総合型あり";
type ExamInfo = {
  year: string;
  front: boolean;
  latter: boolean;
  common: string;
  second: string;
  subjects: string;
  latterCommon?: string;
  latterSecond?: string;
  latterSubjects?: string;
  recommendation: string;
  general: string;
  source: string;
};
type University = {
  name: string;
  area: string;
  type: string;
  tags: Axis[];
  catchcopy: string;
  learning: string;
  admissions: string;
  fit: string;
  scores: Record<Axis, number>;
  source: string;
};

const axes: Axis[] = ["研究", "臨床", "地域医療", "国際性"];
const scoreReasons: Record<string, Record<Axis, string>> = {
  "東京大学": {研究:"先端・学際研究への接続と研究者層が、全国の国公立医学科でも特に厚い。", 臨床:"高度医療を担う附属病院を持つが、比較上は研究面の特色がより強い。", 地域医療:"地域密着型の教育を主軸にする大学ではない。", 国際性:"国際共同研究や海外との学術接点が非常に豊富。"},
  "京都大学": {研究:"自由な学風のもとで基礎医学・生命科学研究を深めやすい。", 臨床:"高度医療と臨床研究を経験できるが、最大の個性は研究環境。", 地域医療:"地域医療特化型のカリキュラムではない。", 国際性:"世界的な研究交流が豊富で、研究を軸に海外へつながりやすい。"},
  "大阪大学": {研究:"基礎研究の成果を治療につなぐ橋渡し研究に強い。", 臨床:"大規模病院と先端医療拠点を生かした高度臨床が際立つ。", 地域医療:"地域密着より高度専門医療を中心に据える。", 国際性:"国際共同研究や海外交流の機会が比較的多い。"},
  "東北大学": {研究:"「研究第一」の伝統と早期から研究に触れやすい環境が明確。", 臨床:"大学病院で高度医療と臨床研究を幅広く学べる。", 地域医療:"東北地域の医療に関わる機会はあるが、地域特化校ほどではない。", 国際性:"研究交流を中心に国際的な接点を持つ。"},
  "東京科学大学": {研究:"医歯工連携を生かした融合研究に独自性がある。", 臨床:"医歯学の専門性と高度専門医療の教育環境が突出。", 地域医療:"都市型・高度専門医療が中心で、地域医療特化型ではない。", 国際性:"海外研修・研究交流を含む国際的な教育環境が充実。"},
  "名古屋大学": {研究:"基礎医学研究の蓄積が厚く、研究医を目指しやすい。", 臨床:"東海の基幹病院として高度医療と広い関連病院網を持つ。", 地域医療:"東海圏への広がりはあるが、地域医療を最重点にはしていない。", 国際性:"国際研究交流や海外への接点を持つ。"},
  "岐阜大学": {研究:"研究機会はあるが、この比較では地域・臨床の特色が中心。", 臨床:"県内医療機関とつながった実践的な臨床教育が強い。", 地域医療:"岐阜県全体を意識した地域医療教育が大きな特色。", 国際性:"海外より県内・地域との連携が教育の中心。"},
  "三重大学": {研究:"基礎・臨床研究を学べるが、比較上は地域医療の特色が強い。", 臨床:"県内の医療現場と連携した臨床教育を受けられる。", 地域医療:"県内医療との結びつきと地域枠を含む人材育成が明確。", 国際性:"国際的な視点を取り入れた教育機会がある。"},
  "浜松医科大学": {研究:"光医学など、医科単科大ならではの特色ある研究領域を持つ。", 臨床:"医学に集中できる環境で臨床教育を積み上げやすい。", 地域医療:"静岡県の医療を支える人材育成と県内連携が強い。", 国際性:"国際交流はあるが、教育の中心は研究・臨床・地域。"},
  "千葉大学": {研究:"研究環境は充実しているが、この比較では臨床・国際性が際立つ。", 臨床:"診療参加型教育と大学病院での実践教育が強い。", 地域医療:"千葉県地域枠など県内医療への入口を持つ。", 国際性:"海外派遣や国際交流を医学教育に組み込みやすい。"},
  "筑波大学": {研究:"総合大学の分野横断環境を生かして研究へ接続できる。", 臨床:"基礎・臨床・社会医学を統合した教育が特徴。", 地域医療:"茨城県の医療とつながる教育・選抜制度が充実。", 国際性:"国際交流はあるが、最大の特色は分野横断と地域連携。"},
  "神戸大学": {研究:"基礎・臨床研究の機会を持つバランス型。", 臨床:"都市型大学病院で高度医療を経験しやすい。", 地域医療:"兵庫県との接点はあるが、地域特化校ほどではない。", 国際性:"国際都市の立地と海外交流を生かしやすい。"},
  "岡山大学": {研究:"長い医学研究の蓄積があり、幅広い領域を選べる。", 臨床:"中四国の基幹として幅広い診療科と関連病院網を持つ。", 地域医療:"中四国の広域医療を支えるネットワークが強い。", 国際性:"国際交流はあるが、臨床・地域ネットワークがより際立つ。"},
  "広島大学": {研究:"放射線医科学など、大学の歴史と結びついた特色領域を持つ。", 臨床:"中国地方の基幹医療を担う環境で幅広く学べる。", 地域医療:"中国地方の医療課題と結びついた教育を展開。", 国際性:"平和・放射線医科学を通じた国際的接点がある。"},
  "信州大学": {研究:"研究機会はあるが、この比較では地域・臨床の特色が中心。", 臨床:"県内協力病院を使った参加型実習を重視。", 地域医療:"長野県全体を学びの場にする地域密着性が際立つ。", 国際性:"海外より県内医療ネットワークとの接続が中心。"},
};

const featuredExamData: Record<string, ExamInfo> = {
  "東京大学": { year:"2026年度", front:true, latter:false, common:"110点", second:"440点", subjects:"国語・数学・理科2・外国語・面接", recommendation:"学校推薦型選抜あり", general:"前期のみ（理科三類）", source:"https://www.u-tokyo.ac.jp/ja/admissions/undergraduate/e01_02_01.html" },
  "京都大学": { year:"2026年度", front:true, latter:false, common:"275点", second:"1,000点", subjects:"国語・数学・理科2・外国語・面接", recommendation:"特色入試あり", general:"前期のみ", source:"https://www.kyoto-u.ac.jp/ja/admissions/undergrad/bosyuu" },
  "大阪大学": { year:"2026年度", front:true, latter:false, common:"500点", second:"1,500点", subjects:"数学・理科2・外国語・面接", recommendation:"学校推薦型選抜あり", general:"前期のみ", source:"https://www.osaka-u.ac.jp/ja/admissions/faculty/general" },
  "東北大学": { year:"2026年度", front:true, latter:false, common:"550点", second:"2,200点", subjects:"数学・理科2・外国語・面接", recommendation:"AOⅡ期・AOⅢ期あり", general:"前期のみ", source:"https://admissions.tohoku.ac.jp/ja/entrance-info/undergraduate-info/general/" },
  "東京科学大学": { year:"2026年度", front:true, latter:true, common:"180点", second:"360点＋面接", subjects:"数学・理科2・外国語・面接", latterCommon:"500点", latterSecond:"200点", latterSubjects:"小論文・面接", recommendation:"学校推薦型・地域特別枠あり", general:"前期・後期", source:"https://admissions.isct.ac.jp/ja/013/undergraduate/guideline" },
  "名古屋大学": { year:"2026年度", front:true, latter:true, common:"950点", second:"1,800点", subjects:"数学・理科2・外国語・面接", latterCommon:"950点", latterSecond:"口頭試問・面接", latterSubjects:"英語課題を用いた口頭試問・面接", recommendation:"学校推薦型選抜あり", general:"前期・後期", source:"https://www.nagoya-u.ac.jp/admissions/exam/" },
  "岐阜大学": { year:"2026年度", front:true, latter:false, common:"950点", second:"1,200点", subjects:"数学・理科2・外国語・面接（面接は総合評価）", recommendation:"学校推薦型選抜Ⅱあり", general:"前期のみ", source:"https://www.gifu-u.ac.jp/admission/f_applicant/guide.html" },
  "三重大学": { year:"2026年度", front:true, latter:true, common:"950点", second:"700点", subjects:"数学・理科2・外国語・面接", latterCommon:"950点", latterSecond:"小論文・面接", latterSubjects:"小論文・面接（配点は募集要項参照）", recommendation:"学校推薦型選抜あり", general:"前期・後期", source:"https://www.mie-u.ac.jp/exam/" },
  "浜松医科大学": { year:"2026年度", front:true, latter:true, common:"950点", second:"700点", subjects:"数学・理科2・外国語・面接", latterCommon:"950点", latterSecond:"小論文・面接", latterSubjects:"小論文・面接（配点は募集要項参照）", recommendation:"学校推薦型選抜あり", general:"前期・後期", source:"https://www.hama-med.ac.jp/admission/" },
  "千葉大学": { year:"2026年度", front:true, latter:true, common:"475点", second:"1,000点", subjects:"数学・理科2・外国語・面接", latterCommon:"475点", latterSecond:"1,000点", latterSubjects:"数学・理科2・外国語・面接", recommendation:"千葉県地域枠あり", general:"前期・後期", source:"https://inh.m.chiba-u.jp/admissions/undergraduate/" },
  "筑波大学": { year:"2026年度", front:true, latter:false, common:"950点", second:"1,700点", subjects:"数学・理科2・外国語・適性試験・面接", recommendation:"学校推薦型・総合型選抜あり", general:"前期のみ", source:"https://ac.tsukuba.ac.jp/apply/application-guidelines/" },
  "神戸大学": { year:"2026年度", front:true, latter:false, common:"450点", second:"810点", subjects:"数学・理科2・外国語・面接", recommendation:"学校推薦型・総合型選抜あり", general:"前期のみ", source:"https://www.office.kobe-u.ac.jp/stdnt-examinavi/juken/" },
  "岡山大学": { year:"2026年度", front:true, latter:false, common:"550点", second:"1,100点", subjects:"数学・理科2・外国語・面接", recommendation:"学校推薦型選抜Ⅱ（地域枠）あり", general:"前期のみ", source:"https://www.okayama-u.ac.jp/tp/admission/index.html" },
  "広島大学": { year:"2026年度", front:true, latter:false, common:"1,000点", second:"1,800点", subjects:"数学・理科2・外国語・面接", recommendation:"学校推薦型・総合型選抜あり", general:"前期のみ", source:"https://www.hiroshima-u.ac.jp/nyushi" },
  "信州大学": { year:"2026年度", front:true, latter:false, common:"1,000点", second:"600点", subjects:"数学・理科2・外国語・面接", recommendation:"学校推薦型選抜Ⅱあり", general:"前期のみ", source:"https://www.shinshu-u.ac.jp/ad_portal/" },
};

const featuredUniversities: University[] = [
  { name: "東京大学", area: "関東", type: "研究志向", tags: ["研究", "国際性"], catchcopy: "医学をつくる側を目指す", learning: "基礎医学から先端・学際研究へ接続しやすい環境。研究医や医学研究者を志す生徒に向く。", admissions: "理科三類から進学。高い総合学力と、教科横断的な思考力が必要。", fit: "未知のテーマを掘り下げ、将来は研究でも医療を変えたい人。", scores: {研究:5, 臨床:4, 地域医療:2, 国際性:5}, source: "https://www.m.u-tokyo.ac.jp/" },
  { name: "京都大学", area: "近畿", type: "研究志向", tags: ["研究", "国際性"], catchcopy: "自由な学風で研究を深める", learning: "自主性を重んじる学風と、基礎・臨床を横断する研究環境が特徴。", admissions: "記述量の多い二次試験。数学・理科で本質的な理解が問われる。", fit: "自分で問いを立て、腰を据えて研究に向き合いたい人。", scores: {研究:5, 臨床:4, 地域医療:2, 国際性:4}, source: "https://www.med.kyoto-u.ac.jp/" },
  { name: "大阪大学", area: "近畿", type: "先端医療", tags: ["研究", "臨床"], catchcopy: "先端研究を臨床へつなぐ", learning: "大規模な大学病院と研究拠点を背景に、基礎研究から高度医療まで見渡せる。", admissions: "二次試験の比重が大きく、英数理を高水準でそろえる必要がある。", fit: "研究成果を患者の治療へ橋渡ししたい人。", scores: {研究:4, 臨床:5, 地域医療:2, 国際性:4}, source: "https://www.med.osaka-u.ac.jp/" },
  { name: "東北大学", area: "東北", type: "研究志向", tags: ["研究", "臨床"], catchcopy: "研究第一の伝統を医学へ", learning: "基礎医学と臨床研究の双方に触れやすく、早い段階から研究を意識できる。", admissions: "標準から発展までを正確に処理する総合力が必要。", fit: "研究と臨床の両方を高い水準で経験したい人。", scores: {研究:5, 臨床:4, 地域医療:3, 国際性:4}, source: "https://www.med.tohoku.ac.jp/" },
  { name: "東京科学大学", area: "関東", type: "高度臨床", tags: ["研究", "臨床", "国際性"], catchcopy: "医歯工連携で次世代医療へ", learning: "医歯学と理工学の融合環境が強み。研究者養成プログラムや高度専門医療に接続する。", admissions: "共通テスト後も個別試験で理系科目の完成度が問われる。", fit: "テクノロジーと医学を結びつけたい人。", scores: {研究:4, 臨床:5, 地域医療:2, 国際性:5}, source: "https://www.med.tmd.ac.jp/" },
  { name: "名古屋大学", area: "東海", type: "研究・基幹", tags: ["研究", "臨床", "国際性"], catchcopy: "東海の基幹で研究と臨床を", learning: "基礎医学研究と大学病院での高度医療を両輪に学べる。東海圏の広い医療ネットワークも魅力。", admissions: "二次試験型。数学・理科の記述力を安定させたい。", fit: "東海に軸足を置きながら研究も臨床も妥協したくない人。", scores: {研究:4, 臨床:4, 地域医療:3, 国際性:4}, source: "https://www.med.nagoya-u.ac.jp/medical_J/" },
  { name: "岐阜大学", area: "東海", type: "地域・臨床", tags: ["臨床", "地域医療"], catchcopy: "地域に根ざして実践力を磨く", learning: "地域医療から高度医療まで、岐阜県の医療現場とのつながりを意識して学べる。", admissions: "共通テストと個別試験、面接を含めた総合評価。年度別要項の確認が重要。", fit: "地域の患者に近い場所で実践力を身につけたい人。", scores: {研究:2, 臨床:4, 地域医療:5, 国際性:2}, source: "https://www.med.gifu-u.ac.jp/" },
  { name: "三重大学", area: "東海", type: "地域・総合", tags: ["臨床", "地域医療", "国際性"], catchcopy: "地域と世界、両方を見る", learning: "県内医療との連携を軸に、地域医療教育と国際的な視点を組み合わせる。", admissions: "面接を含め、学力だけでなく医師志望の具体性も整理したい。", fit: "地域医療に関心があり、外にも視野を広げたい人。", scores: {研究:2, 臨床:3, 地域医療:5, 国際性:3}, source: "https://www.med.mie-u.ac.jp/med/" },
  { name: "浜松医科大学", area: "東海", type: "医科単科", tags: ["研究", "臨床", "地域医療"], catchcopy: "医科単科大で密度高く学ぶ", learning: "光医学など特色ある研究と、静岡県の地域医療を支える臨床教育を併せ持つ。", admissions: "理系科目と面接の準備を一体で進めたい。", fit: "医学に集中できる環境と地域貢献の両方を求める人。", scores: {研究:3, 臨床:4, 地域医療:4, 国際性:2}, source: "https://www.hama-med.ac.jp/" },
  { name: "千葉大学", area: "関東", type: "臨床・国際", tags: ["臨床", "国際性"], catchcopy: "臨床力と国際性を伸ばす", learning: "診療参加型の学びと国際交流を意識した医学教育に取り組む。", admissions: "難度の高い個別試験に加え、面接まで総合的な準備が必要。", fit: "臨床現場で動ける力と国際的な視野を得たい人。", scores: {研究:4, 臨床:5, 地域医療:3, 国際性:5}, source: "https://www.m.chiba-u.jp/" },
  { name: "筑波大学", area: "関東", type: "統合教育", tags: ["研究", "臨床", "地域医療"], catchcopy: "分野を越えて医学を学ぶ", learning: "総合大学の資源を生かし、基礎・臨床・社会医学を統合して学びやすい。", admissions: "推薦・一般など方式ごとの差が大きく、自分に合う入口設計が重要。", fit: "幅広い領域を行き来しながら将来像を探したい人。", scores: {研究:3, 臨床:4, 地域医療:4, 国際性:3}, source: "https://www.md.tsukuba.ac.jp/" },
  { name: "神戸大学", area: "近畿", type: "臨床・国際", tags: ["研究", "臨床", "国際性"], catchcopy: "都市型の臨床と国際性", learning: "都市型大学病院での高度医療と、国際都市の環境を生かした学びが特徴。", admissions: "バランス型の高学力が必要。記述の精度で差がつく。", fit: "高度臨床と国際的なキャリアの両方に関心がある人。", scores: {研究:3, 臨床:4, 地域医療:3, 国際性:4}, source: "https://www.med.kobe-u.ac.jp/education/sm/" },
  { name: "岡山大学", area: "中国", type: "基幹・臨床", tags: ["研究", "臨床", "地域医療"], catchcopy: "中四国の基幹で幅広く学ぶ", learning: "長い医学教育の蓄積と広域の関連病院網を背景に、臨床と研究を幅広く経験できる。", admissions: "二次試験を軸に、標準問題を高精度で積み上げたい。", fit: "幅広い診療科と地域の基幹医療を経験したい人。", scores: {研究:3, 臨床:4, 地域医療:4, 国際性:2}, source: "https://oumed.okayama-u.ac.jp/med/" },
  { name: "広島大学", area: "中国", type: "放射線・地域", tags: ["研究", "臨床", "地域医療"], catchcopy: "平和都市から医療を考える", learning: "放射線医科学を含む特色ある研究と、中国地方の医療を支える臨床教育を展開。", admissions: "方式・配点の変更を確認し、共通テストと二次の配分を設計する。", fit: "特色ある研究と地域の基幹医療に関心がある人。", scores: {研究:4, 臨床:4, 地域医療:4, 国際性:3}, source: "https://www.hiroshima-u.ac.jp/med" },
  { name: "信州大学", area: "甲信越", type: "地域・臨床", tags: ["臨床", "地域医療"], catchcopy: "長野県全体を学びの場に", learning: "県内協力病院と連携した参加型臨床実習を重視し、地域全体で医師を育てる。", admissions: "面接を含め、地域と医療への理解を自分の言葉で説明したい。", fit: "患者参加型の実習と地域医療を大切にしたい人。", scores: {研究:2, 臨床:4, 地域医療:5, 国際性:2}, source: "https://www.shinshu-u.ac.jp/faculty/medicine/" },
];

const pendingExam = (
  source: string,
  recommendation = "学校推薦型・地域枠等あり",
  latter = false,
  front = true,
): ExamInfo => ({
  year: "2027年度",
  front,
  latter,
  common: front ? "公表待ち" : "実施なし",
  second: front ? "公表待ち" : "実施なし",
  subjects: front ? "選抜要項・募集要項の公表後に更新" : "前期日程なし",
  latterCommon: latter ? "公表待ち" : undefined,
  latterSecond: latter ? "公表待ち" : undefined,
  latterSubjects: latter ? "選抜要項・募集要項の公表後に更新" : undefined,
  recommendation,
  general: front ? (latter ? "前期・後期" : "前期のみ") : "後期のみ",
  source,
});

const additionalExamData: Record<string, ExamInfo> = {
  "北海道大学": pendingExam("https://www.hokudai.ac.jp/admission/"),
  "旭川医科大学": pendingExam("https://www.asahikawa-med.ac.jp/admission/"),
  "札幌医科大学": pendingExam("https://web.sapmed.ac.jp/jp/public/exam/"),
  "弘前大学": pendingExam("https://www.hirosaki-u.ac.jp/admission/"),
  "秋田大学": pendingExam("https://www.akita-u.ac.jp/honbu/exam/", "学校推薦型選抜Ⅱあり", true),
  "山形大学": pendingExam("https://www.yamagata-u.ac.jp/jp/entrance/"),
  "福島県立医科大学": pendingExam("https://www.fmu.ac.jp/admission/"),
  "群馬大学": pendingExam("https://www.gunma-u.ac.jp/admission/"),
  "横浜市立大学": pendingExam("https://www.yokohama-cu.ac.jp/admissions/"),
  "新潟大学": pendingExam("https://www.niigata-u.ac.jp/admissions/"),
  "富山大学": pendingExam("https://www.u-toyama.ac.jp/admission/"),
  "金沢大学": pendingExam("https://www.kanazawa-u.ac.jp/admission/"),
  "福井大学": pendingExam("https://www.u-fukui.ac.jp/user_admission/", "学校推薦型選抜Ⅱ・地域枠あり", true),
  "山梨大学": pendingExam("https://www.yamanashi.ac.jp/admission/", "学校推薦型選抜Ⅱ（地域枠）あり", true, false),
  "名古屋市立大学": pendingExam("https://www.nagoya-cu.ac.jp/admissions/"),
  "滋賀医科大学": pendingExam("https://www.shiga-med.ac.jp/admission/"),
  "京都府立医科大学": pendingExam("https://www.kpu-m.ac.jp/doc/examination/"),
  "大阪公立大学": pendingExam("https://www.omu.ac.jp/admissions/"),
  "奈良県立医科大学": pendingExam("https://www.naramed-u.ac.jp/university/nyushijoho/", "学校推薦型選抜・地域枠あり", true),
  "和歌山県立医科大学": pendingExam("https://www.wakayama-med.ac.jp/nyushi/"),
  "鳥取大学": pendingExam("https://www.tottori-u.ac.jp/admission/"),
  "島根大学": pendingExam("https://www.shimane-u.ac.jp/nyushi/"),
  "山口大学": pendingExam("https://www.yamaguchi-u.ac.jp/nyushi/", "学校推薦型選抜Ⅱ・地域枠あり", true),
  "徳島大学": pendingExam("https://www.tokushima-u.ac.jp/admission/"),
  "香川大学": pendingExam("https://www.kagawa-u.ac.jp/admission/"),
  "愛媛大学": pendingExam("https://www.ehime-u.ac.jp/entrance/"),
  "高知大学": pendingExam("https://nyusi.kochi-u.jp/"),
  "九州大学": pendingExam("https://www.kyushu-u.ac.jp/ja/admission/", "総合型選抜あり"),
  "佐賀大学": pendingExam("https://www.sao.saga-u.ac.jp/"),
  "長崎大学": pendingExam("https://www.nagasaki-u.ac.jp/nyugaku/"),
  "熊本大学": pendingExam("https://www.kumamoto-u.ac.jp/nyuushi/"),
  "大分大学": pendingExam("https://www.oita-u.ac.jp/000005236.shtml"),
  "宮崎大学": pendingExam("https://www.miyazaki-u.ac.jp/exam/", "学校推薦型選抜・地域枠あり", true),
  "鹿児島大学": pendingExam("https://www.kagoshima-u.ac.jp/exam/", "学校推薦型選抜Ⅱあり", true),
  "琉球大学": pendingExam("https://www.u-ryukyu.ac.jp/admissions/", "学校推薦型選抜Ⅱ・地域枠あり", true),
};

const additionalUniversities: University[] = [
  {name:"北海道大学",area:"北海道",type:"総合・研究",tags:["研究","臨床"],catchcopy:"総合大学の広がりを医学へ",learning:"基礎医学から高度臨床までを、総合大学の幅広い研究資源と結びつけて学べる。",admissions:"英数理を中心に、標準から発展までの記述力が必要。",fit:"医学以外の分野にも視野を広げながら学びたい人。",scores:{研究:4,臨床:4,地域医療:3,国際性:4},source:"https://www.med.hokudai.ac.jp/"},
  {name:"旭川医科大学",area:"北海道",type:"地域・臨床",tags:["臨床","地域医療"],catchcopy:"北の地域医療を現場で学ぶ",learning:"道北・道東の広い医療圏と結びつき、地域医療と実践的な臨床教育を重視する。",admissions:"地域医療への理解と志望理由を、学力・面接の両面で示したい。",fit:"広域・へき地医療に具体的な関心を持つ人。",scores:{研究:2,臨床:4,地域医療:5,国際性:2},source:"https://www.asahikawa-med.ac.jp/"},
  {name:"札幌医科大学",area:"北海道",type:"公立・地域基幹",tags:["臨床","地域医療"],catchcopy:"北海道の医療を支える公立医大",learning:"高度医療と地域医療の双方を、北海道全域との連携の中で学ぶ。",admissions:"道内医療への理解と高い理系学力を両立したい。",fit:"北海道で臨床医として力を発揮したい人。",scores:{研究:3,臨床:4,地域医療:4,国際性:2},source:"https://web.sapmed.ac.jp/med/"},
  {name:"弘前大学",area:"東北",type:"地域・総合",tags:["研究","地域医療"],catchcopy:"地域課題を医学研究につなぐ",learning:"青森県の医療課題に向き合いながら、基礎・社会医学にも広く触れられる。",admissions:"科目構成の特色を踏まえ、面接まで一体で準備したい。",fit:"地域の健康課題を研究と実践の両面から考えたい人。",scores:{研究:3,臨床:3,地域医療:4,国際性:2},source:"https://www.med.hirosaki-u.ac.jp/"},
  {name:"秋田大学",area:"東北",type:"地域・臨床",tags:["臨床","地域医療"],catchcopy:"地域で育つ総合診療力",learning:"高齢化・医師偏在など地域の現実に近い環境で、総合的な臨床力を養う。",admissions:"前期と後期の違い、推薦枠の条件を整理して選びたい。",fit:"地域に入り込み、患者を全人的に診たい人。",scores:{研究:2,臨床:4,地域医療:4,国際性:2},source:"https://www.med.akita-u.ac.jp/"},
  {name:"山形大学",area:"東北",type:"地域・基幹",tags:["臨床","地域医療"],catchcopy:"地域の基幹で着実に学ぶ",learning:"県内医療機関との連携を通じ、基礎から臨床まで段階的に力を伸ばす。",admissions:"標準問題を高精度で得点し、面接で医師志望を言語化したい。",fit:"堅実な学びと地域貢献を両立したい人。",scores:{研究:3,臨床:4,地域医療:4,国際性:2},source:"https://www.id.yamagata-u.ac.jp/"},
  {name:"福島県立医科大学",area:"東北",type:"公立・地域医療",tags:["研究","地域医療"],catchcopy:"災害・地域医療の知見を未来へ",learning:"地域医療に加え、災害医療・放射線医学など福島ならではの課題に向き合う。",admissions:"地域枠を含む方式ごとの条件と面接評価を丁寧に確認したい。",fit:"社会課題に直結する医学を学びたい人。",scores:{研究:4,臨床:4,地域医療:4,国際性:3},source:"https://www.fmu.ac.jp/education/medicine/"},
  {name:"群馬大学",area:"関東",type:"地域・臨床",tags:["臨床","地域医療"],catchcopy:"チーム医療を実践的に学ぶ",learning:"医療系学部との連携と県内実習を通じ、チーム医療と臨床力を伸ばす。",admissions:"小論文・面接を含む選抜要素の確認が重要。",fit:"多職種と協働できる臨床医を目指す人。",scores:{研究:3,臨床:4,地域医療:4,国際性:2},source:"https://www.med.gunma-u.ac.jp/"},
  {name:"横浜市立大学",area:"関東",type:"都市・臨床",tags:["研究","臨床","国際性"],catchcopy:"都市医療と研究を近い距離で",learning:"横浜の高度医療拠点と研究環境を生かし、都市型の臨床課題に向き合う。",admissions:"共通テストと二次をバランスよく高水準に仕上げたい。",fit:"都市部の高度臨床と研究に関心がある人。",scores:{研究:4,臨床:4,地域医療:3,国際性:4},source:"https://www.yokohama-cu.ac.jp/med/"},
  {name:"新潟大学",area:"甲信越",type:"研究・地域基幹",tags:["研究","臨床","地域医療"],catchcopy:"医学の伝統を地域の力へ",learning:"長い医学教育の蓄積と広い関連病院網を背景に、研究と臨床を幅広く学ぶ。",admissions:"二次の理系科目を軸に、安定した記述力をつけたい。",fit:"研究も地域の基幹医療も幅広く経験したい人。",scores:{研究:4,臨床:4,地域医療:4,国際性:3},source:"https://www.med.niigata-u.ac.jp/"},
  {name:"富山大学",area:"北陸",type:"統合・地域",tags:["研究","地域医療"],catchcopy:"東西医学を横断して考える",learning:"医学・薬学・和漢医薬学の接点を持ち、地域医療と特色研究を組み合わせる。",admissions:"共通テストと二次の配点差を見て学習配分を決めたい。",fit:"医療を多角的に捉え、特色ある研究にも触れたい人。",scores:{研究:4,臨床:3,地域医療:4,国際性:2},source:"https://www.med.u-toyama.ac.jp/"},
  {name:"金沢大学",area:"北陸",type:"研究・基幹",tags:["研究","臨床"],catchcopy:"北陸の基幹で研究を深める",learning:"がん・脳神経などの研究基盤と関連病院網を持ち、高度医療へ接続しやすい。",admissions:"英数理の記述力をそろえ、総合点で崩れない準備が必要。",fit:"基礎研究と高度臨床をバランスよく学びたい人。",scores:{研究:4,臨床:4,地域医療:3,国際性:3},source:"https://med.w3.kanazawa-u.ac.jp/"},
  {name:"福井大学",area:"北陸",type:"地域・臨床",tags:["臨床","地域医療"],catchcopy:"地域参加型の臨床力を磨く",learning:"県内医療機関との連携を生かし、診療参加型の実習と地域医療を重視する。",admissions:"後期を含め、日程別の個別試験内容を確認したい。",fit:"患者に近い実習環境で実践力を高めたい人。",scores:{研究:3,臨床:4,地域医療:4,国際性:2},source:"https://www.med.u-fukui.ac.jp/"},
  {name:"山梨大学",area:"甲信越",type:"後期・研究",tags:["研究","臨床"],catchcopy:"後期一本の独自方式で挑む",learning:"医学工学融合や発生・再生医学などに接続し、少人数環境で医学に集中する。",admissions:"一般選抜は後期のみ。共通テスト後の出願戦略が非常に重要。",fit:"強い理系学力を後期日程で生かしたい人。",scores:{研究:4,臨床:3,地域医療:3,国際性:2},source:"https://www.med.yamanashi.ac.jp/"},
  {name:"名古屋市立大学",area:"東海",type:"都市・高度臨床",tags:["研究","臨床"],catchcopy:"都市型公立大で高度医療へ",learning:"名古屋市の医療拠点を背景に、基礎研究と都市型の高度臨床を学ぶ。",admissions:"理科を含む二次の比重と面接を意識して準備したい。",fit:"東海圏で高度臨床と研究の両方を求める人。",scores:{研究:4,臨床:5,地域医療:3,国際性:3},source:"https://www.nagoya-cu.ac.jp/med/"},
  {name:"滋賀医科大学",area:"近畿",type:"医科単科・地域",tags:["臨床","地域医療"],catchcopy:"滋賀の医療を密度高く学ぶ",learning:"医科単科大学の集中した環境で、地域医療と臨床実習を積み上げる。",admissions:"共通テストの比重と二次科目を年度要項で確認したい。",fit:"医学に集中できる環境と地域への接続を求める人。",scores:{研究:3,臨床:4,地域医療:4,国際性:2},source:"https://www.shiga-med.ac.jp/"},
  {name:"京都府立医科大学",area:"近畿",type:"公立・高度臨床",tags:["研究","臨床"],catchcopy:"長い伝統を高度臨床へ",learning:"長い医学教育の歴史と附属病院・関連病院網を背景に、高度な臨床を学ぶ。",admissions:"難度の高い記述試験に対応する完成度が必要。",fit:"伝統ある環境で専門性の高い臨床医を目指す人。",scores:{研究:4,臨床:5,地域医療:3,国際性:3},source:"https://www.kpu-m.ac.jp/doc/"},
  {name:"大阪公立大学",area:"近畿",type:"都市・臨床",tags:["研究","臨床"],catchcopy:"大都市の医療課題に向き合う",learning:"都市部の多様な症例と研究資源を生かし、実践的な臨床教育を展開する。",admissions:"二次の英数理を高水準に仕上げ、面接まで崩さない。",fit:"大都市ならではの幅広い臨床経験を求める人。",scores:{研究:4,臨床:5,地域医療:3,国際性:3},source:"https://www.omu.ac.jp/med/"},
  {name:"奈良県立医科大学",area:"近畿",type:"公立・後期",tags:["研究","臨床","地域医療"],catchcopy:"高い専門性を後期まで問う",learning:"県の基幹医療を担いながら、臨床・研究の双方で専門性を伸ばす。",admissions:"前期と募集規模の大きい後期で、科目・配点が大きく異なる。",fit:"最後まで高い記述力で勝負したい人。",scores:{研究:4,臨床:4,地域医療:4,国際性:2},source:"https://www.naramed-u.ac.jp/"},
  {name:"和歌山県立医科大学",area:"近畿",type:"公立・地域",tags:["臨床","地域医療"],catchcopy:"地域を支える実践医療",learning:"県内の医療課題と直結した教育で、地域から高度医療までを経験する。",admissions:"地域枠等の要件と面接を含む総合評価を確認したい。",fit:"和歌山の地域医療に長く貢献したい人。",scores:{研究:3,臨床:4,地域医療:4,国際性:2},source:"https://www.wakayama-med.ac.jp/"},
  {name:"鳥取大学",area:"中国",type:"地域・統合",tags:["研究","地域医療"],catchcopy:"生命科学と地域医療をつなぐ",learning:"生命科学系との接点と山陰の地域医療を生かし、幅広く医学を捉える。",admissions:"標準問題の精度と面接での地域理解をそろえたい。",fit:"生命科学にも地域の臨床にも関心がある人。",scores:{研究:4,臨床:3,地域医療:4,国際性:2},source:"https://www.med.tottori-u.ac.jp/"},
  {name:"島根大学",area:"中国",type:"地域・総合診療",tags:["臨床","地域医療"],catchcopy:"地域医療を学びの中心に",learning:"早期体験や地域実習を通じ、総合診療と医師偏在の課題に深く向き合う。",admissions:"地域枠・推薦の条件と一般選抜を比較して入口を選びたい。",fit:"地域に入り、暮らしごと患者を診たい人。",scores:{研究:2,臨床:4,地域医療:5,国際性:2},source:"https://www.med.shimane-u.ac.jp/"},
  {name:"山口大学",area:"中国",type:"研究・地域",tags:["研究","臨床","地域医療"],catchcopy:"研究と地域の両輪で学ぶ",learning:"基礎・臨床研究と県内医療機関との連携を、バランスよく経験できる。",admissions:"前期・後期・推薦で異なる選抜設計を整理したい。",fit:"研究にも地域の臨床にも軸を残したい人。",scores:{研究:4,臨床:4,地域医療:4,国際性:3},source:"https://www.med.yamaguchi-u.ac.jp/"},
  {name:"徳島大学",area:"四国",type:"研究・医歯薬",tags:["研究","臨床"],catchcopy:"医歯薬の連携で医学を深める",learning:"医歯薬系が集まる環境を生かし、基礎医学・栄養・生命科学へ横断しやすい。",admissions:"共通テストと二次の比率を踏まえた得点設計が重要。",fit:"医療系分野を横断しながら研究したい人。",scores:{研究:4,臨床:3,地域医療:3,国際性:3},source:"https://www.tokushima-u.ac.jp/med/"},
  {name:"香川大学",area:"四国",type:"地域・臨床",tags:["臨床","地域医療"],catchcopy:"地域の現場で臨床を磨く",learning:"香川県内の医療機関と連携し、地域医療と実践的な臨床教育を進める。",admissions:"共通テストの科目別配点と面接まで確認したい。",fit:"地域の患者に近い医療を学びたい人。",scores:{研究:3,臨床:4,地域医療:4,国際性:2},source:"https://www.med.kagawa-u.ac.jp/"},
  {name:"愛媛大学",area:"四国",type:"地域・研究",tags:["研究","臨床","地域医療"],catchcopy:"地域医療と先端研究を両立",learning:"県内医療との連携に加え、プロテオサイエンスなど特色研究へ接続できる。",admissions:"方式ごとの科目と配点変更を公式要項で追いたい。",fit:"地域に貢献しながら特色ある研究にも挑みたい人。",scores:{研究:4,臨床:4,地域医療:4,国際性:2},source:"https://www.m.ehime-u.ac.jp/"},
  {name:"高知大学",area:"四国",type:"地域・総合診療",tags:["臨床","地域医療"],catchcopy:"地域から総合診療を学ぶ",learning:"高知県の医療課題を背景に、地域・家庭医療と患者中心の臨床を重視する。",admissions:"推薦・地域枠を含め、志望動機の具体性が重要。",fit:"総合診療やへき地医療を将来像に持つ人。",scores:{研究:2,臨床:4,地域医療:5,国際性:2},source:"https://www.kochi-ms.ac.jp/"},
  {name:"九州大学",area:"九州・沖縄",type:"研究・高度臨床",tags:["研究","臨床","国際性"],catchcopy:"九州の研究・医療を牽引する",learning:"厚い研究基盤と高度医療拠点を持ち、基礎から臨床まで高い水準で学べる。",admissions:"難度の高い英数理をそろえ、記述の完成度で勝負する。",fit:"研究医・高度専門医のどちらにも可能性を広げたい人。",scores:{研究:5,臨床:5,地域医療:3,国際性:5},source:"https://www.med.kyushu-u.ac.jp/"},
  {name:"佐賀大学",area:"九州・沖縄",type:"地域・臨床",tags:["臨床","地域医療"],catchcopy:"地域に近い臨床教育",learning:"早期から地域医療に触れ、県内の医療現場と結びついた実践力を養う。",admissions:"推薦を含む方式ごとの差を比較し、面接まで準備したい。",fit:"患者との距離が近い環境で成長したい人。",scores:{研究:2,臨床:4,地域医療:4,国際性:2},source:"https://www.med.saga-u.ac.jp/"},
  {name:"長崎大学",area:"九州・沖縄",type:"感染症・国際",tags:["研究","臨床","国際性"],catchcopy:"感染症と国際保健を深める",learning:"熱帯医学・感染症・被ばく医療など、歴史と立地に根ざす世界的な研究資源を持つ。",admissions:"理系科目に加え、大学の特色への理解を面接で示したい。",fit:"感染症や国際保健の最前線で学びたい人。",scores:{研究:5,臨床:4,地域医療:3,国際性:5},source:"https://www.med.nagasaki-u.ac.jp/"},
  {name:"熊本大学",area:"九州・沖縄",type:"研究・基幹",tags:["研究","臨床"],catchcopy:"生命科学研究を臨床へ",learning:"発生医学・生命科学の研究基盤と地域の基幹医療を結びつけて学ぶ。",admissions:"英数理を高水準でそろえ、二次型の準備を進めたい。",fit:"基礎研究の成果を臨床につなげたい人。",scores:{研究:5,臨床:4,地域医療:3,国際性:4},source:"https://www.medphas.kumamoto-u.ac.jp/medical/"},
  {name:"大分大学",area:"九州・沖縄",type:"地域・臨床",tags:["臨床","地域医療"],catchcopy:"地域の現場で総合力を養う",learning:"大分県内の医療機関と連携し、地域医療を土台に臨床力を積み上げる。",admissions:"共通テスト・個別・面接の総合評価を意識したい。",fit:"地域で必要とされる総合的な医師を目指す人。",scores:{研究:2,臨床:4,地域医療:4,国際性:2},source:"https://www.med.oita-u.ac.jp/"},
  {name:"宮崎大学",area:"九州・沖縄",type:"地域・後期",tags:["臨床","地域医療"],catchcopy:"地域医療を前期・後期で目指す",learning:"宮崎県の地域医療と結びついた教育で、現場対応力を磨く。",admissions:"前期・後期の個別試験の違いを早めに把握したい。",fit:"地域医療への志望が明確で、後期も視野に入れる人。",scores:{研究:2,臨床:4,地域医療:4,国際性:2},source:"https://www.med.miyazaki-u.ac.jp/"},
  {name:"鹿児島大学",area:"九州・沖縄",type:"地域・離島医療",tags:["臨床","地域医療"],catchcopy:"離島を含む広域医療を学ぶ",learning:"離島・へき地を含む多様な医療現場を背景に、地域医療と臨床を学ぶ。",admissions:"前期・後期・推薦を見渡して出願設計したい。",fit:"離島医療や広域の地域医療に関心がある人。",scores:{研究:3,臨床:4,地域医療:4,国際性:3},source:"https://www.kufm.kagoshima-u.ac.jp/"},
  {name:"琉球大学",area:"九州・沖縄",type:"島嶼・国際",tags:["臨床","地域医療","国際性"],catchcopy:"島嶼医療からアジアを見る",learning:"沖縄の島嶼医療と国際的な立地を生かし、地域と世界をつなぐ医学を学ぶ。",admissions:"前期・後期と地域枠の条件を分けて確認したい。",fit:"島嶼医療と国際的な視野の両方を持ちたい人。",scores:{研究:3,臨床:4,地域医療:4,国際性:4},source:"https://www.med.u-ryukyu.ac.jp/"},
];

const examData: Record<string, ExamInfo> = {...featuredExamData, ...additionalExamData};
const universities: University[] = [...featuredUniversities, ...additionalUniversities];
const areas = ["すべて", "北海道", "東北", "関東", "甲信越", "北陸", "東海", "近畿", "中国", "四国", "九州・沖縄"];
const favoritesKey = "homes-medical-favorites-v1";
const scoreReason = (university: University, axis: Axis) => {
  const saved = scoreReasons[university.name]?.[axis];
  if (saved) return saved;
  const score = university.scores[axis];
  const label = score === 5 ? "全国でも特に際立つ特色" : score === 4 ? "明確な強み" : score === 3 ? "標準的な学習環境" : "他の軸により強い特色";
  const connection = university.tags.includes(axis) ? university.learning : university.fit;
  return `${label}として評価。${connection}`;
};

type AnalyticsParams = Record<string, string | number | boolean>;

const trackEvent = (eventName: string, params: AnalyticsParams = {}) => {
  if (typeof window === "undefined") return;
  const analyticsWindow = window as typeof window & {
    gtag?: (command: "event", name: string, parameters?: AnalyticsParams) => void;
  };
  analyticsWindow.gtag?.("event", eventName, params);
};

export default function Home() {
  const [query, setQuery] = useState("");
  const [activeAxes, setActiveAxes] = useState<Axis[]>([]);
  const [activeArea, setActiveArea] = useState("すべて");
  const [sortBy, setSortBy] = useState<"標準" | Axis>("標準");
  const [examFilter, setExamFilter] = useState<ExamFilter>("すべて");
  const [comparison, setComparison] = useState<string[]>([]);
  const [selected, setSelected] = useState<University | null>(null);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [selectedColumn, setSelectedColumn] = useState<MedicalColumn | null>(null);
  const [columnAutoPaused, setColumnAutoPaused] = useState(false);
  const columnScroller = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let saved: unknown = [];
    try {
      saved = JSON.parse(localStorage.getItem(favoritesKey) ?? "[]");
    } catch {
      localStorage.removeItem(favoritesKey);
    }
    const timer = window.setTimeout(() => {
      if (Array.isArray(saved)) setFavorites(saved.filter((name): name is string => typeof name === "string"));
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (columnAutoPaused || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timer = window.setInterval(() => {
      const scroller = columnScroller.current;
      if (!scroller) return;
      const reachedEnd = scroller.scrollLeft + scroller.clientWidth >= scroller.scrollWidth - 24;
      scroller.scrollTo({
        left: reachedEnd ? 0 : scroller.scrollLeft + Math.min(scroller.clientWidth * 0.82, 430),
        behavior: "smooth",
      });
    }, 5500);
    return () => window.clearInterval(timer);
  }, [columnAutoPaused]);

  const filtered = useMemo(() => universities.filter((u) => {
    const matchesQuery = `${u.name}${u.area}${u.catchcopy}${u.tags.join("")}`.includes(query.trim());
    const matchesAxes = activeAxes.every((axis) => u.tags.includes(axis));
    const matchesArea = activeArea === "すべて" || u.area === activeArea;
    const exam = examData[u.name];
    const matchesExam = examFilter === "すべて" || (examFilter === "後期あり" ? exam.latter : exam.recommendation.includes("あり"));
    const matchesFavorite = !showFavoritesOnly || favorites.includes(u.name);
    return matchesQuery && matchesAxes && matchesArea && matchesExam && matchesFavorite;
  }).sort((a, b) => sortBy === "標準" ? 0 : b.scores[sortBy] - a.scores[sortBy]), [query, activeAxes, activeArea, sortBy, examFilter, showFavoritesOnly, favorites]);

  const compared = comparison.map((name) => universities.find((u) => u.name === name)!).filter(Boolean);

  const toggleAxis = (axis: Axis) =>
    setActiveAxes((current) => current.includes(axis) ? current.filter((a) => a !== axis) : [...current, axis]);

  const toggleCompare = (name: string) => {
    setComparison((current) => {
      const isRemoving = current.includes(name);
      const next = isRemoving
        ? current.filter((n) => n !== name)
        : current.length < 2
          ? [...current, name]
          : current;
      if (next !== current) {
        trackEvent("compare_change", {
          university: name,
          action: isRemoving ? "remove" : "add",
          comparison_count: next.length,
        });
      }
      return next;
    });
  };

  const toggleFavorite = (name: string) => {
    setFavorites((current) => {
      const isRemoving = current.includes(name);
      const next = isRemoving ? current.filter((n) => n !== name) : [...current, name];
      try {
        localStorage.setItem(favoritesKey, JSON.stringify(next));
      } catch {
        // 保存できない環境でも、この表示中は選択状態を維持する
      }
      trackEvent("favorite_change", {
        university: name,
        action: isRemoving ? "remove" : "add",
        favorites_count: next.length,
      });
      return next;
    });
  };

  const openUniversityDetail = (university: University) => {
    trackEvent("university_detail_view", {
      university: university.name,
      area: university.area,
      university_type: university.type,
    });
    setSelected(university);
  };

  const openColumn = (column: MedicalColumn) => {
    trackEvent("medical_column_view", {
      column_slug: column.slug,
      grade: column.grade,
      category: column.category,
    });
    setSelectedColumn(column);
  };

  const scrollColumns = (direction: -1 | 1) => {
    columnScroller.current?.scrollBy({
      left: direction * Math.min(columnScroller.current.clientWidth * 0.82, 430),
      behavior: "smooth",
    });
  };

  const returnToTop = () => {
    setSelectedColumn(null);
    setSelected(null);
    window.requestAnimationFrame(() => window.scrollTo({ top: 0, behavior: "smooth" }));
  };

  return (
    <main>
      <header className="site-header">
        <a className="brand" href="#top" aria-label="偏差値だけではわからない トップ">
          <span className="brand-sign">Yoshi</span>
          <span className="brand-copy"><small>偏差値だけではわからない</small>医学部編</span>
        </a>
        <nav aria-label="メインナビゲーション">
          <a href="#universities">大学を探す</a>
          <a href="#admissions">入試情報</a>
          <a href="#compare">比較する</a>
          <a href="#columns">進路コラム</a>
          <a href="#universities" onClick={() => setShowFavoritesOnly(true)}>気になる大学 {favorites.length > 0 && <b>{favorites.length}</b>}</a>
          <a href="#guide">選び方ガイド</a>
        </nav>
      </header>

      <section className="hero" id="top">
        <div className="hero-copy">
          <div className="series-label"><span>Yoshi’s guide</span> 偏差値だけではわからない</div>
          <p className="hero-kicker">SERIES 01 ｜ 国公立医学部</p>
          <h1>医学部の違いは、<br /><em>偏差値だけじゃない。</em></h1>
          <p className="hero-lead">入試方式、研究、臨床、地域医療。<br />数字の向こうにある「6年間の学び」を、Yoshiと一緒に見ていこう。</p>
          <div className="hero-actions">
            <a className="button primary" href="#universities">自分に合う医学部を探す <span>→</span></a>
            <a className="button secondary" href="#universities" onClick={() => setShowFavoritesOnly(true)}>気になる大学を見る <span>♡</span></a>
          </div>
          <p className="updated">2027年度情報を順次反映｜未公表項目は2026年度参考または公表待ちと表示｜出願時は必ず大学公式募集要項で確認</p>
        </div>
        <div className="yoshi-visual" aria-label="案内役のYoshi">
          <div className="yoshi-frame">
            <img src={`${import.meta.env.BASE_URL}yoshi.png`} alt="" aria-hidden="true" />
          </div>
          <img className="yoshi-popout" src={`${import.meta.env.BASE_URL}yoshi-cutout.png`} alt="緑の恐竜の着ぐるみを着た案内役Yoshiのイラスト" />
          <div className="yoshi-bubble">どこで学ぶかも、<b>大事。</b></div>
          <div className="yoshi-caption">
            <span>このサイトの案内役</span>
            <strong>Yoshi <small>ヨッシー</small></strong>
            <p>大学選びの、見えにくい違いを整理します。</p>
          </div>
        </div>
      </section>

      <section className="column-section" id="columns">
        <div className="column-heading">
          <div>
            <p className="eyebrow">FOR FUTURE DOCTORS</p>
            <h2>医学部志望のための進路コラム</h2>
          </div>
          <p>受験科目の選び方から出願戦略まで。<br />「それ、先に知りたかった」をYoshiと整理します。</p>
        </div>
        <div className="column-scroll-controls" aria-label="コラムを横に移動">
          <span>横にスライドして記事を探す</span>
          <button type="button" onClick={() => scrollColumns(-1)} aria-label="前のコラム">←</button>
          <button type="button" onClick={() => scrollColumns(1)} aria-label="次のコラム">→</button>
        </div>
        <div
          className="column-grid"
          ref={columnScroller}
          onMouseEnter={() => setColumnAutoPaused(true)}
          onMouseLeave={() => setColumnAutoPaused(false)}
          onFocus={() => setColumnAutoPaused(true)}
          onBlur={(event) => {
            if (!event.currentTarget.contains(event.relatedTarget)) setColumnAutoPaused(false);
          }}
          onTouchStart={() => setColumnAutoPaused(true)}
          onTouchEnd={() => window.setTimeout(() => setColumnAutoPaused(false), 1800)}
          aria-label="医学部志望向け進路コラム"
        >
          {medicalColumns.map((column, index) => (
            <article className="column-card" key={column.slug}>
              <div className="column-card-meta">
                <span>{column.grade}</span>
                <b>{column.category}</b>
                <small>{column.readTime}で読む</small>
              </div>
              <p className="column-number">{String(index + 1).padStart(2, "0")}</p>
              <h3>{column.title}</h3>
              <p>{column.lead}</p>
              <button onClick={() => openColumn(column)}>コラムを読む <span>→</span></button>
            </article>
          ))}
        </div>
      </section>

      <section className="finder" id="universities">
        <div className="finder-header">
          <div>
            <p className="eyebrow">FIND YOUR SCHOOL</p>
            <h2>大学を探す</h2>
          </div>
          <label className="search-box">
            <span aria-hidden="true">検索</span>
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="大学名・地域・特徴から検索" />
          </label>
        </div>
        <div className="filter-panel">
          <div className="filter-group">
            <p>地域</p>
            <div className="area-filters">
              {areas.map((area) => <button key={area} className={activeArea === area ? "active" : ""} onClick={() => setActiveArea(area)}>{area}</button>)}
            </div>
          </div>
          <div className="filter-group">
            <p>学びの特徴</p>
          <div className="axis-filters" aria-label="学びの特徴で絞り込み">
            {axes.map((axis) => (
              <button key={axis} className={activeAxes.includes(axis) ? "active" : ""} onClick={() => toggleAxis(axis)}>
                {axis}
              </button>
            ))}
          </div>
          </div>
          <div className="filter-group admission-filter">
            <p>入試方式</p>
            <div className="axis-filters" aria-label="入試方式で絞り込み">
              {(["すべて", "後期あり", "推薦・総合型あり"] as ExamFilter[]).map((filter) => (
                <button key={filter} className={examFilter === filter ? "active" : ""} onClick={() => setExamFilter(filter)}>{filter}</button>
              ))}
            </div>
          </div>
          <div className="filter-group favorite-filter">
            <p>保存リスト</p>
            <div className="axis-filters" aria-label="気になる大学で絞り込み">
              <button className={!showFavoritesOnly ? "active" : ""} onClick={() => setShowFavoritesOnly(false)}>すべて</button>
              <button className={showFavoritesOnly ? "active" : ""} onClick={() => setShowFavoritesOnly(true)}>♡ 気になる大学のみ（{favorites.length}）</button>
            </div>
          </div>
        </div>

        <div className="result-row">
          <p><b>{filtered.length}</b><span> / {universities.length}大学</span></p>
          <div className="result-tools">
            <label>並び替え
              <select value={sortBy} onChange={(e) => setSortBy(e.target.value as "標準" | Axis)}>
                <option>標準</option>{axes.map((axis) => <option key={axis}>{axis}</option>)}
              </select>
            </label>
            {(query || activeAxes.length > 0 || activeArea !== "すべて" || examFilter !== "すべて" || showFavoritesOnly) && <button className="text-button" onClick={() => {setQuery(""); setActiveAxes([]); setActiveArea("すべて"); setSortBy("標準"); setExamFilter("すべて"); setShowFavoritesOnly(false);}}>条件をクリア</button>}
          </div>
        </div>
        <div className="score-note">
          <b>学びの評価は全国の国公立医学科内での相対比較</b>
          <span><i>5</i> 特に際立つ</span><span><i>4</i> 強みが明確</span><span><i>3</i> 標準的</span><span><i>2</i> 他の特色が中心</span>
        </div>

        {filtered.length === 0 && <div className="empty-results">{showFavoritesOnly && favorites.length === 0 ? "大学カードの「♡ 気になる」を押すと、この端末に保存できます。" : "条件に合う大学がありません。条件を変更してみてください。"}</div>}
        <div className="university-grid">
          {filtered.map((u, index) => (
            <article className="university-card" key={u.name}>
              <div className="card-head">
                <div className="university-name">
                  <span className="list-number">{String(index + 1).padStart(2, "0")}</span>
                  <div><p className="meta">{u.area}　/　{u.type}</p><h2>{u.name}</h2></div>
                </div>
                <div className="card-actions">
                  <button className={`favorite-button ${favorites.includes(u.name) ? "saved" : ""}`} aria-pressed={favorites.includes(u.name)} onClick={() => toggleFavorite(u.name)}>
                    <span aria-hidden="true">{favorites.includes(u.name) ? "♥" : "♡"}</span>{favorites.includes(u.name) ? "保存済み" : "気になる"}
                  </button>
                  <label className="compare-check">
                    <input type="checkbox" checked={comparison.includes(u.name)} onChange={() => toggleCompare(u.name)} disabled={!comparison.includes(u.name) && comparison.length >= 2} />
                    比較に追加
                  </label>
                </div>
              </div>
              <div className="card-body">
                <div className="card-copy">
                  <p className="catchcopy">{u.catchcopy}</p>
                  <p className="learning">{u.learning}</p>
                  <div className="tags">{u.tags.map((tag) => <span key={tag}>{tag}</span>)}</div>
                </div>
                <div className="score-table" aria-label={`${u.name}の学びの特徴`}>
                  {axes.map((axis) => <div key={axis}><span>{axis}</span><b>{u.scores[axis]}</b><i><em style={{width: `${u.scores[axis] * 20}%`}} /></i></div>)}
                </div>
              </div>
              <div className="exam-strip">
                <div className="schedule-badges">
                  <span className={examData[u.name].front ? "on" : "off"}>前期</span>
                  {examData[u.name].latter && <span className="on">後期あり</span>}
                  <span className={examData[u.name].recommendation.includes("あり") ? "on" : "off"}>推薦等</span>
                </div>
                <div className="schedule-lines">
                  {examData[u.name].front && <dl><dt>前期</dt><dd>共テ {examData[u.name].common}<span>／</span>二次 {examData[u.name].second}</dd></dl>}
                  {examData[u.name].latter && <dl><dt>後期</dt><dd>共テ {examData[u.name].latterCommon}<span>／</span>個別 {examData[u.name].latterSecond}</dd></dl>}
                </div>
              </div>
              <button className="detail-button" onClick={() => openUniversityDetail(u)}>詳しく見る <span>→</span></button>
            </article>
          ))}
        </div>
      </section>

      <section className="admission-section" id="admissions">
        <div className="section-heading">
          <p className="eyebrow">ADMISSIONS AT A GLANCE</p>
          <h2>入試の違いを、同じ型で読む。</h2>
          <p>一般選抜の日程、共通テストと二次の配点、二次科目、推薦・総合型の有無を整理。2027年度未公表項目は公表待ちと明示しています。</p>
        </div>
        <div className="admission-key">
          <article><b>日程</b><p>前期・後期の有無。後期は募集人数が少ない大学もあるため、定員まで要項で確認。</p></article>
          <article><b>配点</b><p>共通テストと二次の満点を並べ、どちらの比重が大きいかを判断。</p></article>
          <article><b>科目・方式</b><p>二次科目と面接、推薦・総合型の入口を確認。方式ごとに条件が異なります。</p></article>
        </div>
      </section>

      <section className="compare-section" id="compare">
        <div className="section-heading">
          <p className="eyebrow">SIDE BY SIDE</p>
          <h2>2校を並べると、違いが見える。</h2>
          <p>カードの「比較に追加」を選ぶと、学びと入試の特徴を同じ軸で確認できます。「気になる」への保存とは別の機能です。</p>
        </div>
        {compared.length === 0 ? (
          <div className="empty-compare">
            <span
              className="yoshi-pose yoshi-pose-pointing"
              style={{ backgroundImage: `url(${import.meta.env.BASE_URL}yoshi-poses-transparent.png)` }}
              aria-hidden="true"
            />
            <div>
              <b>比べたい大学、上で選んでみよう。</b>
              <p>上の大学カードで「比較に追加」を選択してください（2校まで）。</p>
            </div>
          </div>
        ) : (
          <div className={`comparison-table comparison-count-${compared.length}`}>
            <div className="comparison-labels"><b>比較項目</b><span>一般選抜</span><span>前期 共テ / 二次</span><span>後期 共テ / 個別</span><span>個別試験科目</span><span>推薦・総合型</span><span>学びの特徴</span></div>
            {compared.map((u) => {
              const exam = examData[u.name];
              return (
                <div className="comparison-column" key={u.name}>
                  <div className="comparison-university-header">
                    <b>{u.name}</b>
                    <button type="button" onClick={() => toggleCompare(u.name)} aria-label={`${u.name}を比較から外す`}>
                      <span aria-hidden="true">×</span> 比較から外す
                    </button>
                  </div>
                  <span data-label="一般選抜">{exam.general}</span>
                  <span data-label="前期 配点">{exam.front ? `共テ ${exam.common} ／ 二次 ${exam.second}` : "実施なし"}</span>
                  <span data-label="後期 配点">{exam.latter ? `共テ ${exam.latterCommon} ／ 個別 ${exam.latterSecond}` : "実施なし"}</span>
                  <p data-label="個別試験">{exam.front ? `前期：${exam.subjects}` : "前期：実施なし"}{exam.latter && <><br />後期：{exam.latterSubjects}</>}</p>
                  <p data-label="推薦等">{exam.recommendation}</p>
                  <p data-label="学び">{axes.map((axis) => `${axis} ${u.scores[axis]}`).join("　")}</p>
                </div>
              );
            })}
            <div className="comparison-actions">
              <a href="#universities">大学を選び直す</a>
              <button type="button" onClick={() => setComparison([])}>比較をすべて解除</button>
            </div>
          </div>
        )}
      </section>

      <section className="guide" id="guide">
        <div className="section-heading">
          <p className="eyebrow">HOW TO CHOOSE</p>
          <h2>医学部選びは、「入口」と「6年間」を分けて考える。</h2>
        </div>
        <div className="guide-grid">
          <article><span>01</span><h3>まず入試の相性</h3><p>共通テストと二次の比率、得意科目、面接を確認。合格可能性を現実的に考えます。</p></article>
          <article><span>02</span><h3>次に学びの特徴</h3><p>研究・臨床・地域医療・国際性のうち、自分が重視したい軸を選びます。</p></article>
          <article><span>03</span><h3>最後に進路と生活</h3><p>関連病院、卒業後の地域、キャンパス環境まで含め、6年間を具体的に想像します。</p></article>
        </div>
      </section>

      <footer>
        <p className="footer-series"><b>Yoshi</b>｜偏差値だけではわからない〈医学部編〉</p>
        <p className="footer-note">掲載内容は大学公式サイトをもとにした要約です。出願時は最新の募集要項・カリキュラムを必ず確認してください。</p>
      </footer>

      {comparison.length > 0 && <a className="compare-dock" href="#compare"><b>{comparison.length}</b>校を比較する <span>→</span></a>}
      {favorites.length > 0 && <a className="favorite-dock" href="#universities" onClick={() => setShowFavoritesOnly(true)}><span>♥</span><b>{favorites.length}</b>校を保存中</a>}
      <button className="floating-top" type="button" onClick={returnToTop} aria-label="ページの先頭へ戻る">
        <span>↑</span> TOP
      </button>

      {selectedColumn && (
        <div className="modal-backdrop" onMouseDown={() => setSelectedColumn(null)}>
          <article className="column-modal" role="dialog" aria-modal="true" aria-labelledby="column-title" onMouseDown={(e) => e.stopPropagation()}>
            <button className="modal-close" aria-label="閉じる" onClick={() => setSelectedColumn(null)}>×</button>
            <div className="column-article-meta">
              <span>{selectedColumn.grade}</span>
              <b>{selectedColumn.category}</b>
              <small>{selectedColumn.readTime}で読む</small>
            </div>
            <p className="column-article-kicker">YOSHI’S MEDICAL COLUMN</p>
            <h2 id="column-title">{selectedColumn.title}</h2>
            <p className="column-article-lead">{selectedColumn.lead}</p>
            <div className="column-article-visual">
              <img
                className="column-hero-yoshi"
                src={`${import.meta.env.BASE_URL}${selectedColumn.poseImage}`}
                alt=""
                aria-hidden="true"
              />
              <div>
                <b>この記事でわかること</b>
                <ol>
                  {selectedColumn.sections.map((section) => <li key={section.heading}>{section.heading}</li>)}
                </ol>
              </div>
            </div>
            <blockquote><b>Yoshi</b>「{selectedColumn.yoshi}」</blockquote>
            <div className="column-article-body">
              {selectedColumn.sections.map((section, index) => (
                <section key={section.heading}>
                  <p className="column-section-number">{String(index + 1).padStart(2, "0")}</p>
                  <h3>{section.heading}</h3>
                  {section.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
                  {section.points && <ul>{section.points.map((point) => <li key={point}>{point}</li>)}</ul>}
                  {section.table && (
                    <div className="column-data-table">
                      <div className="column-data-scroll">
                        <table>
                          <thead><tr>{section.table.headers.map((header) => <th key={header}>{header}</th>)}</tr></thead>
                          <tbody>{section.table.rows.map((row) => <tr key={row.join("-")}>{row.map((cell, cellIndex) => <td key={`${cell}-${cellIndex}`}>{cell}</td>)}</tr>)}</tbody>
                        </table>
                      </div>
                      {section.table.note && <small>{section.table.note}</small>}
                    </div>
                  )}
                </section>
              ))}
            </div>
            <div className="column-takeaway"><span>結論</span><p>{selectedColumn.takeaway}</p></div>
            {selectedColumn.sources && (
              <div className="column-sources">
                <b>大学公式の確認資料</b>
                <div>
                  {selectedColumn.sources.map((source) => (
                    <a key={source.url} href={source.url} target="_blank" rel="noreferrer">
                      {source.label} <span>↗</span>
                    </a>
                  ))}
                </div>
              </div>
            )}
            <p className="column-disclaimer">※ 入試科目・配点・日程は変更される場合があります。出願時は必ず各大学の最新募集要項を確認してください。</p>
            <button
              className="back-to-top"
              onClick={returnToTop}
            >
              ↑ TOPに戻る
            </button>
          </article>
        </div>
      )}

      {selected && (
        <div className="modal-backdrop" onMouseDown={() => setSelected(null)}>
          <section className="detail-modal" role="dialog" aria-modal="true" aria-labelledby="detail-title" onMouseDown={(e) => e.stopPropagation()}>
            <button className="modal-close" aria-label="閉じる" onClick={() => setSelected(null)}>×</button>
            <p className="meta">{selected.area}・{selected.type}</p>
            <h2 id="detail-title">{selected.name}</h2>
            <p className="modal-catch">{selected.catchcopy}</p>
            <button className={`modal-favorite ${favorites.includes(selected.name) ? "saved" : ""}`} aria-pressed={favorites.includes(selected.name)} onClick={() => toggleFavorite(selected.name)}>
              {favorites.includes(selected.name) ? "♥ 気になる大学に保存済み" : "♡ 気になる大学に保存"}
            </button>
            <div className="modal-block"><h3>6年間の学び</h3><p>{selected.learning}</p></div>
            <div className="modal-block">
              <div className="modal-section-title"><h3>学びの評価と根拠</h3><span>全国50大学内の相対評価</span></div>
              <dl className="reason-list">
                {axes.map((axis) => (
                  <div key={axis}>
                    <dt><span>{axis}</span><b>{selected.scores[axis]}</b></dt>
                    <dd>{scoreReason(selected, axis)}</dd>
                  </div>
                ))}
              </dl>
            </div>
            <div className="modal-block"><h3>入試の見方</h3><p>{selected.admissions}</p></div>
            <div className="modal-block exam-detail">
              <div className="modal-section-title"><h3>入試情報</h3><span>{examData[selected.name].year}</span></div>
              <div className="modal-schedules">
                <span className={examData[selected.name].front ? "available" : "unavailable"}>前期 {examData[selected.name].front ? "あり" : "なし"}</span>
                <span className={examData[selected.name].latter ? "available" : "unavailable"}>後期 {examData[selected.name].latter ? "あり" : "なし"}</span>
              </div>
              <dl className="exam-facts">
                <div><dt>一般選抜</dt><dd>{examData[selected.name].general}</dd></div>
                {examData[selected.name].front && <div className="exam-schedule-row"><dt>前期</dt><dd><b>共テ {examData[selected.name].common} ／ 二次 {examData[selected.name].second}</b><small>{examData[selected.name].subjects}</small></dd></div>}
                {examData[selected.name].latter && <div className="exam-schedule-row latter-row"><dt>後期</dt><dd><b>共テ {examData[selected.name].latterCommon} ／ 個別 {examData[selected.name].latterSecond}</b><small>{examData[selected.name].latterSubjects}</small></dd></div>}
                <div><dt>推薦・総合型</dt><dd>{examData[selected.name].recommendation}</dd></div>
              </dl>
              <a
                className="source-link official-source"
                href={examData[selected.name].source}
                target="_blank"
                rel="noreferrer"
                onClick={() => trackEvent("official_link_click", {
                  university: selected.name,
                  link_type: "admissions",
                })}
              ><span>公式</span> 大学公式の入試情報・募集要項を見る ↗</a>
            </div>
            <div className="modal-block accent"><h3>こんな生徒に向く</h3><p>{selected.fit}</p></div>
            {studentRealities[selected.name]?.length > 0 && (
              <section className="reality-section" aria-labelledby="reality-title">
                <div className="reality-title-row">
                  <div>
                    <p className="reality-kicker">REAL CAMPUS LIFE</p>
                    <h3 id="reality-title">先に言ってよ、大学さん。</h3>
                  </div>
                  <span
                    className="yoshi-pose yoshi-pose-thinking"
                    style={{ backgroundImage: `url(${import.meta.env.BASE_URL}yoshi-poses-transparent.png)` }}
                    aria-hidden="true"
                  />
                  <span>{studentRealities[selected.name].length}件</span>
                </div>
                <p className="reality-intro">入試情報だけでは見えにくい、入学後の「地味に困る」を先回り。大学を否定する情報ではなく、知っていれば対策できる生活メモです。</p>
                <div className="reality-list">
                  {studentRealities[selected.name].map((item, index) => (
                    <details
                      className="reality-card"
                      key={`${item.tag}-${index}`}
                      open={index === 0}
                      onToggle={(event) => {
                        if (event.currentTarget.open) {
                          trackEvent("campus_reality_open", {
                            university: selected.name,
                            reality_tag: item.tag,
                            reality_position: index + 1,
                          });
                        }
                      }}
                    >
                      <summary>
                        <span className="reality-tag">{item.tag}</span>
                        <b>{item.trouble}</b>
                        <i aria-hidden="true">＋</i>
                      </summary>
                      <div className="reality-body">
                        <p className="yoshi-comment"><span>Yoshi</span>「{item.yoshi}」</p>
                        <dl>
                          <div><dt>① 地味に困ること</dt><dd>{item.trouble}</dd></div>
                          <div><dt>② 学生生活への影響</dt><dd>{item.impact}</dd></div>
                          <div><dt>③ 現実的な対策</dt><dd>{item.solution}</dd></div>
                        </dl>
                        <a
                          href={item.sourceUrl}
                          target="_blank"
                          rel="noreferrer"
                          onClick={() => trackEvent("official_link_click", {
                            university: selected.name,
                            link_type: "campus_reality_source",
                          })}
                        >根拠にした公開情報：{item.sourceLabel} ↗</a>
                      </div>
                    </details>
                  ))}
                </div>
                <p className="reality-note">※ 公開情報から想定できる生活上の注意を、断定を避けて整理しています。施設・時間割・交通事情は変更される場合があります。</p>
              </section>
            )}
            <div className="official-links">
              <a
                className="official-link"
                href={selected.source}
                target="_blank"
                rel="noreferrer"
                onClick={() => trackEvent("official_link_click", {
                  university: selected.name,
                  link_type: "university",
                })}
              >大学・医学部公式サイト ↗</a>
              <small>入試情報は上の公式募集要項で最終確認してください。</small>
            </div>
            <button
              className="back-to-top"
              onClick={returnToTop}
            >
              ↑ TOPに戻る
            </button>
          </section>
        </div>
      )}
    </main>
  );
}
