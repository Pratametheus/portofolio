import type {CaseStudySection} from '@/content/types';

export function CaseStudyBody({sections}: {sections: CaseStudySection[]}) {
  return (
    <div className="space-y-16">
      {sections.map((section) => (
        <section key={section.heading}>
          <h2 className="font-display text-3xl text-fg">{section.heading}</h2>
          <div className="mt-6 space-y-5 text-fg-muted">
            {section.blocks.map((block, index) => {
              if (block.type === 'p') {
                return (
                  <p key={index} className="whitespace-pre-line leading-7">
                    {block.text}
                  </p>
                );
              }

              if (block.type === 'list') {
                return (
                  <ul key={index} className="list-disc space-y-2 pl-6">
                    {block.items.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                );
              }

              if (block.type === 'table') {
                return (
                  <div key={index} className="overflow-x-auto">
                    <table className="w-full border-collapse font-mono text-sm">
                      <tbody>
                        {block.rows.map(([label, value]) => (
                          <tr key={`${label}-${value}`} className="border-b border-border align-top">
                            <th scope="row" className="py-3 pr-6 text-left font-medium text-fg">
                              {label}
                            </th>
                            <td className="py-3">{value}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                );
              }

              return (
                <blockquote key={index} className="border-l-2 border-accent pl-5 text-fg">
                  <p className="whitespace-pre-line leading-7">{block.text}</p>
                </blockquote>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}
