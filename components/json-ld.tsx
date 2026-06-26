// 구조화 데이터(JSON-LD)를 <script> 태그로 삽입한다. 서버 컴포넌트에서 렌더된다.
export function JsonLd({ data }: { data: Record<string, unknown> }) {
  // `<` 를 이스케이프해 script 태그 조기 종료(XSS)를 방지한다.
  const json = JSON.stringify(data).replace(/</g, "\\u003c");
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: json }}
    />
  );
}
