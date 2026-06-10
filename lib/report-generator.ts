import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  Table,
  TableRow,
  TableCell,
  WidthType,
  BorderStyle,
  AlignmentType,
  HeadingLevel,
  PageBreak,
} from "docx";
import type { AnalysisResult, SynthesisResult, DimensionKey } from "./types";

/**
 * Creates a standard styled TableCell using editorial margins and borders.
 */
function createTableCell(
  content: Paragraph | Paragraph[],
  options?: {
    fill?: string;
    widthPercent?: number;
    noBorders?: boolean;
    valign?: "top" | "center" | "bottom";
  }
): TableCell {
  const children = Array.isArray(content) ? content : [content];
  return new TableCell({
    shading: options?.fill ? { fill: options.fill } : undefined,
    margins: { top: 120, bottom: 120, left: 180, right: 180 },
    borders: options?.noBorders
      ? {
          top: { style: BorderStyle.NONE },
          bottom: { style: BorderStyle.NONE },
          left: { style: BorderStyle.NONE },
          right: { style: BorderStyle.NONE },
        }
      : {
          top: { style: BorderStyle.SINGLE, size: 4, color: "D9D2C2" },
          bottom: { style: BorderStyle.SINGLE, size: 4, color: "D9D2C2" },
          left: { style: BorderStyle.NONE },
          right: { style: BorderStyle.NONE },
        },
    width: options?.widthPercent
      ? { size: options.widthPercent, type: WidthType.PERCENTAGE }
      : undefined,
    children,
  });
}

function createMonoEyebrow(text: string, spaceBefore = 240): Paragraph {
  return new Paragraph({
    spacing: { before: spaceBefore, after: 80 },
    children: [
      new TextRun({
        text: text.toUpperCase(),
        font: "IBM Plex Mono",
        size: 18, // 9pt
        color: "C44536",
        bold: true,
      }),
    ],
  });
}

function createHeading1(text: string, spaceBefore = 400): Paragraph {
  return new Paragraph({
    spacing: { before: spaceBefore, after: 160 },
    heading: HeadingLevel.HEADING_1,
    children: [
      new TextRun({
        text: text,
        font: "Fraunces",
        size: 36, // 18pt
        color: "2A4F4F",
        bold: true,
      }),
    ],
  });
}

function createHeading2(text: string, spaceBefore = 300): Paragraph {
  return new Paragraph({
    spacing: { before: spaceBefore, after: 120 },
    heading: HeadingLevel.HEADING_2,
    children: [
      new TextRun({
        text: text,
        font: "Fraunces",
        size: 26, // 13pt
        color: "2A4F4F",
        bold: true,
      }),
    ],
  });
}

function createBodyParagraph(text: string, italic = false): Paragraph {
  return new Paragraph({
    spacing: { after: 140, line: 260, before: 80 },
    children: [
      new TextRun({
        text,
        font: "IBM Plex Sans",
        size: 20, // 10pt
        color: "1F1B16",
        italics: italic,
      }),
    ],
  });
}

function createQuoteBox(text: string): Paragraph {
  return new Paragraph({
    spacing: { before: 120, after: 160 },
    indent: { left: 400, right: 400 },
    children: [
      new TextRun({
        text: `“${text}”`,
        font: "Fraunces",
        size: 19, // 9.5pt
        color: "6B6358",
        italics: true,
      }),
    ],
  });
}

/**
 * Generates an editorial Microsoft Word (.docx) document containing 
 * the comprehensive batch narrative synthesis report.
 */
export async function generateWordReport(
  articles: AnalysisResult[],
  synthesis: SynthesisResult,
  metadata: { batchName?: string; exportedAt: string; totalAnalyzed: number }
): Promise<Buffer> {
  const elements: any[] = [];

  // ---------------------------------------------------------------------------
  // 1. COVER PAGE (PORTADA)
  // ---------------------------------------------------------------------------
  elements.push(
    new Paragraph({ spacing: { before: 1800 } }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [
        new TextRun({
          text: "CHANGEMAKER WORLDVIEW · SCORING MATRIX",
          font: "IBM Plex Mono",
          size: 20,
          color: "C44536",
          bold: true,
        }),
      ],
    }),
    new Paragraph({ spacing: { before: 400 } }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [
        new TextRun({
          text: "Narrative Analysis Report",
          font: "Fraunces",
          size: 68,
          color: "2A4F4F",
          bold: true,
        }),
      ],
    }),
    new Paragraph({ spacing: { before: 100 } })
  );

  if (metadata.batchName) {
    elements.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [
          new TextRun({
            text: metadata.batchName,
            font: "Fraunces",
            size: 30,
            color: "1F1B16",
            italics: true,
          }),
        ],
      })
    );
  }

  elements.push(
    new Paragraph({ spacing: { before: 1600 } }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [
        new TextRun({
          text: `CORPUS SIZE: `,
          font: "IBM Plex Mono",
          size: 18,
          color: "6B6358",
        }),
        new TextRun({
          text: `${metadata.totalAnalyzed} Article${metadata.totalAnalyzed === 1 ? "" : "s"}\r\n`,
          font: "IBM Plex Mono",
          size: 18,
          bold: true,
          color: "1F1B16",
        }),
        new TextRun({
          text: `ANALYSIS DATE: `,
          font: "IBM Plex Mono",
          size: 18,
          color: "6B6358",
        }),
        new TextRun({
          text: `${new Date(metadata.exportedAt).toLocaleDateString("en-US", {
            month: "long",
            day: "numeric",
            year: "numeric",
          })}\r\n`,
          font: "IBM Plex Mono",
          size: 18,
          bold: true,
          color: "1F1B16",
        }),
      ],
    }),
    new Paragraph({ spacing: { before: 1800 } }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [
        new TextRun({
          text: "ASHOKA · FRAMEWORK CHANGE",
          font: "IBM Plex Mono",
          size: 18,
          color: "6B6358",
          bold: true,
        }),
      ],
    }),
    new Paragraph({ children: [new PageBreak()] })
  );

  // ---------------------------------------------------------------------------
  // 2. EXECUTIVE SUMMARY
  // ---------------------------------------------------------------------------
  elements.push(
    createMonoEyebrow("PART I"),
    createHeading1("Executive Summary"),
    ...synthesis.executiveSummary.split("\n\n").map((para) => createBodyParagraph(para.trim())),
    new Paragraph({ spacing: { before: 300 } })
  );

  // ---------------------------------------------------------------------------
  // 3. COMMUNITY PROFILE
  // ---------------------------------------------------------------------------
  elements.push(
    createMonoEyebrow("PART II"),
    createHeading1("Community Paradigmatic Profile"),
    createBodyParagraph(synthesis.communityProfile.narrativeSummary),
    new Paragraph({ spacing: { before: 120 } })
  );

  // Community profile table
  const profileTable = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      new TableRow({
        tableHeader: true,
        children: [
          createTableCell(
            new Paragraph({
              children: [
                new TextRun({
                  text: "DOMINANT PARADIGM",
                  font: "IBM Plex Mono",
                  color: "FAF7F0",
                  bold: true,
                  size: 18,
                }),
              ],
            }),
            { fill: "2A4F4F", widthPercent: 25 }
          ),
          createTableCell(
            new Paragraph({
              children: [
                new TextRun({
                  text: "AVG SCORE",
                  font: "IBM Plex Mono",
                  color: "FAF7F0",
                  bold: true,
                  size: 18,
                }),
              ],
            }),
            { fill: "2A4F4F", widthPercent: 15 }
          ),
          createTableCell(
            new Paragraph({
              children: [
                new TextRun({
                  text: "KEY STRENGTHS",
                  font: "IBM Plex Mono",
                  color: "FAF7F0",
                  bold: true,
                  size: 18,
                }),
              ],
            }),
            { fill: "2A4F4F", widthPercent: 30 }
          ),
          createTableCell(
            new Paragraph({
              children: [
                new TextRun({
                  text: "KEY GAPS",
                  font: "IBM Plex Mono",
                  color: "FAF7F0",
                  bold: true,
                  size: 18,
                }),
              ],
            }),
            { fill: "2A4F4F", widthPercent: 30 }
          ),
        ],
      }),
      new TableRow({
        children: [
          createTableCell(
            new Paragraph({
              children: [
                new TextRun({
                  text: synthesis.communityProfile.dominantParadigm,
                  font: "Fraunces",
                  bold: true,
                  size: 22,
                  color: "C44536",
                }),
              ],
            }),
            { widthPercent: 25 }
          ),
          createTableCell(
            new Paragraph({
              children: [
                new TextRun({
                  text: `${synthesis.communityProfile.averageScore.toFixed(1)}/100`,
                  font: "IBM Plex Mono",
                  bold: true,
                  size: 20,
                }),
              ],
            }),
            { widthPercent: 15 }
          ),
          createTableCell(
            synthesis.communityProfile.keyStrengths.length === 0
              ? new Paragraph({
                  children: [
                    new TextRun({
                      text: "No sufficient evidence found in this corpus.",
                      font: "IBM Plex Sans",
                      size: 18,
                      italics: true,
                    }),
                  ],
                })
              : synthesis.communityProfile.keyStrengths.map(
                  (str) =>
                    new Paragraph({
                      bullet: { level: 0 },
                      spacing: { after: 60 },
                      children: [
                        new TextRun({
                          text: str,
                          font: "IBM Plex Sans",
                          size: 18,
                        }),
                      ],
                    })
                ),
            { widthPercent: 30 }
          ),
          createTableCell(
            synthesis.communityProfile.keyGaps.length === 0
              ? new Paragraph({
                  children: [
                    new TextRun({
                      text: "No sufficient evidence found in this corpus.",
                      font: "IBM Plex Sans",
                      size: 18,
                      italics: true,
                    }),
                  ],
                })
              : synthesis.communityProfile.keyGaps.map(
                  (gap) =>
                    new Paragraph({
                      bullet: { level: 0 },
                      spacing: { after: 60 },
                      children: [
                        new TextRun({
                          text: gap,
                          font: "IBM Plex Sans",
                          size: 18,
                        }),
                      ],
                    })
                ),
            { widthPercent: 30 }
          ),
        ],
      }),
    ],
  });

  elements.push(profileTable, new Paragraph({ children: [new PageBreak()] }));

  // ---------------------------------------------------------------------------
  // 4. DIMENSION ANALYSIS
  // ---------------------------------------------------------------------------
  elements.push(
    createMonoEyebrow("PART III"),
    createHeading1("Deep Dimension Breakdown"),
    createBodyParagraph(
      "A rigorous assessment across the five pillars of the Changemaker worldview, highlighting collective scores and textual illustrations."
    )
  );

  if (synthesis.dimensionInsights.length === 0) {
    elements.push(createBodyParagraph("No sufficient evidence found in this corpus.", true));
  } else {
    synthesis.dimensionInsights.forEach((dim) => {
      elements.push(
        createHeading2(`${dim.dimension} — ${dim.dimensionName}`),
        new Paragraph({
          spacing: { after: 100 },
          children: [
            new TextRun({
              text: `COMMUNITY AVERAGE: `,
              font: "IBM Plex Mono",
              size: 18,
              color: "6B6358",
            }),
            new TextRun({
              text: `${dim.communityAverage.toFixed(2)} / 4.00\r\n`,
              font: "IBM Plex Mono",
              size: 18,
              bold: true,
              color: "C44536",
            }),
          ],
        }),
        createBodyParagraph(dim.insight),
        dim.representativeQuote ? createQuoteBox(dim.representativeQuote) : new Paragraph({ spacing: { after: 100 } })
      );
    });
  }

  elements.push(new Paragraph({ children: [new PageBreak()] }));

  // ---------------------------------------------------------------------------
  // 5. HELLO WORLD SHIFTS
  // ---------------------------------------------------------------------------
  elements.push(
    createMonoEyebrow("PART IV"),
    createHeading1("Hello World Narrative Shifts"),
    createBodyParagraph(
      "Measuring the narrative positioning of people in movement and migration. Ideal narratives emphasize active agency and systemic contributions rather than victimhood or passive reliance."
    )
  );

  if (synthesis.helloWorldShifts.length === 0) {
    elements.push(createBodyParagraph("No sufficient evidence found in this corpus.", true));
  } else {
    synthesis.helloWorldShifts.forEach((shift) => {
      elements.push(
        createHeading2(shift.shiftLabel),
        new Paragraph({
          spacing: { after: 100 },
          children: [
            new TextRun({
              text: `FREQUENCY OF EMBODIMENT: `,
              font: "IBM Plex Mono",
              size: 18,
              color: "6B6358",
            }),
            new TextRun({
              text: `${shift.frequency.toUpperCase()}\r\n`,
              font: "IBM Plex Mono",
              size: 18,
              bold: true,
              color:
                shift.frequency === "High"
                  ? "2A5A3E"
                  : shift.frequency === "Medium"
                  ? "3D5A6C"
                  : shift.frequency === "Low"
                  ? "7A6B3E"
                  : "C44536",
            }),
          ],
        }),
        createBodyParagraph(shift.insight),
        shift.exampleQuote ? createQuoteBox(shift.exampleQuote) : new Paragraph({ spacing: { after: 100 } })
      );
    });
  }

  elements.push(new Paragraph({ children: [new PageBreak()] }));

  // ---------------------------------------------------------------------------
  // 6. NARRATIVE PATTERNS
  // ---------------------------------------------------------------------------
  elements.push(
    createMonoEyebrow("PART V"),
    createHeading1("Identified Narrative Patterns"),
    createBodyParagraph(
      "Themes and recurring literary conventions observed across the submitted texts."
    )
  );

  if (synthesis.narrativePatterns.length === 0) {
    elements.push(createBodyParagraph("No sufficient evidence found in this corpus.", true));
  } else {
    synthesis.narrativePatterns.forEach((pat, i) => {
      elements.push(
        createHeading2(`${i + 1}. ${pat.pattern}`),
        new Paragraph({
          spacing: { after: 80 },
          children: [
            new TextRun({
              text: `DISTRIBUTION: `,
              font: "IBM Plex Mono",
              size: 18,
              color: "6B6358",
            }),
            new TextRun({
              text: `${pat.frequency}\r\n`,
              font: "IBM Plex Mono",
              size: 18,
              bold: true,
              color: "1F1B16",
            }),
          ],
        }),
        createBodyParagraph(pat.description),
        pat.exampleQuote ? createQuoteBox(pat.exampleQuote) : new Paragraph({ spacing: { after: 100 } })
      );
    });
  }

  elements.push(new Paragraph({ children: [new PageBreak()] }));

  // ---------------------------------------------------------------------------
  // 7. GEOGRAPHIC COVERAGE
  // ---------------------------------------------------------------------------
  elements.push(
    createMonoEyebrow("PART VI"),
    createHeading1("Geographic Coverage & Distribution"),
    createBodyParagraph(synthesis.geographicCoverage.summary),
    createHeading2("Primary Geographies Highlighted")
  );

  if (synthesis.geographicCoverage.mainLocations.length === 0) {
    elements.push(createBodyParagraph("No sufficient evidence found in this corpus.", true));
  } else {
    elements.push(
      new Paragraph({
        spacing: { after: 140 },
        children: [
          new TextRun({
            text: synthesis.geographicCoverage.mainLocations.join(" · "),
            font: "IBM Plex Mono",
            size: 18,
            bold: true,
            color: "2A4F4F",
          }),
        ],
      })
    );
  }

  elements.push(
    createHeading2("Identified Geographic Gaps"),
    createBodyParagraph(synthesis.geographicCoverage.gaps),
    new Paragraph({ spacing: { before: 200 } })
  );


  // ---------------------------------------------------------------------------
  // 8. STANDOUT VOICES
  // ---------------------------------------------------------------------------
  elements.push(
    createMonoEyebrow("PART VII"),
    createHeading1("Standout Narrative Voices"),
    createBodyParagraph(
      "High-performing articles which provide exemplary narrative models for changemaker agency."
    )
  );

  if (synthesis.standoutVoices.length === 0) {
    elements.push(createBodyParagraph("No sufficient evidence found in this corpus.", true));
  } else {
    synthesis.standoutVoices.forEach((voice, i) => {
      elements.push(
        createHeading2(`${i + 1}. ${voice.articleName}`),
        new Paragraph({
          spacing: { after: 100 },
          children: [
            new TextRun({
              text: `SCORE: `,
              font: "IBM Plex Mono",
              size: 18,
              color: "6B6358",
            }),
            new TextRun({
              text: `${voice.score}/100 `,
              font: "IBM Plex Mono",
              size: 18,
              bold: true,
              color: "C44536",
            }),
            new TextRun({
              text: ` · PARADIGM: `,
              font: "IBM Plex Mono",
              size: 18,
              color: "6B6358",
            }),
            new TextRun({
              text: `${voice.paradigm.toUpperCase()}\r\n`,
              font: "IBM Plex Mono",
              size: 18,
              bold: true,
              color: "2A4F4F",
            }),
          ],
        }),
        createBodyParagraph(voice.whatMakesItDifferent),
        new Paragraph({ spacing: { after: 120 } })
      );
    });
  }

  elements.push(new Paragraph({ children: [new PageBreak()] }));

  // ---------------------------------------------------------------------------
  // 9. OPPORTUNITIES
  // ---------------------------------------------------------------------------
  elements.push(
    createMonoEyebrow("PART VIII"),
    createHeading1("Narrative Recommendations"),
    createBodyParagraph(
      "Strategic opportunities to steer future storytelling and reporting closer to active and systemic changemaking paradigms."
    ),
    ...(synthesis.opportunities.length === 0
      ? [
          new Paragraph({
            spacing: { after: 120 },
            children: [
              new TextRun({
                text: "No sufficient evidence found in this corpus.",
                font: "IBM Plex Sans",
                size: 20,
                italics: true,
              }),
            ],
          }),
        ]
      : synthesis.opportunities.map(
          (opp) =>
            new Paragraph({
              bullet: { level: 0 },
              spacing: { after: 120 },
              children: [
                new TextRun({
                  text: opp,
                  font: "IBM Plex Sans",
                  size: 20,
                }),
              ],
            })
        )),
    new Paragraph({ children: [new PageBreak()] })
  );

  // ---------------------------------------------------------------------------
  // 10. APPENDIX (APÉNDICE - DATOS COMPLETOS)
  // ---------------------------------------------------------------------------
  elements.push(
    createMonoEyebrow("APPENDIX"),
    createHeading1("Complete Corpus Quantitative Data"),
    createBodyParagraph(
      "Raw dimension and consolidated scoring data for every successfully evaluated article in the batch."
    ),
    new Paragraph({ spacing: { before: 120 } })
  );

  // Header row
  const headerCells = [
    createTableCell(
      new Paragraph({
        children: [
          new TextRun({
            text: "ARTICLE NAME",
            font: "IBM Plex Mono",
            color: "FAF7F0",
            bold: true,
            size: 16,
          }),
        ],
      }),
      { fill: "2A4F4F", widthPercent: 25 }
    ),
    createTableCell(
      new Paragraph({
        children: [
          new TextRun({
            text: "SCORE",
            font: "IBM Plex Mono",
            color: "FAF7F0",
            bold: true,
            size: 16,
          }),
        ],
      }),
      { fill: "2A4F4F", widthPercent: 10 }
    ),
    createTableCell(
      new Paragraph({
        children: [
          new TextRun({
            text: "PARADIGM",
            font: "IBM Plex Mono",
            color: "FAF7F0",
            bold: true,
            size: 16,
          }),
        ],
      }),
      { fill: "2A4F4F", widthPercent: 15 }
    ),
    createTableCell(
      new Paragraph({
        children: [
          new TextRun({
            text: "EACH",
            font: "IBM Plex Mono",
            color: "FAF7F0",
            bold: true,
            size: 16,
          }),
        ],
      }),
      { fill: "2A4F4F", widthPercent: 15 }
    ),
    ...(["D1", "D2", "D3", "D4", "D5"].map((dName) =>
      createTableCell(
        new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [
            new TextRun({
              text: dName,
              font: "IBM Plex Mono",
              color: "FAF7F0",
              bold: true,
              size: 16,
            }),
          ],
        }),
        { fill: "2A4F4F", widthPercent: 7 }
      )
    )),
  ];

  const tableRows = [new TableRow({ tableHeader: true, children: headerCells })];

  // Data rows
  articles.forEach((item) => {
    const res = item.score;
    const nameStr = (item as any).name || "Untitled";

    tableRows.push(
      new TableRow({
        children: [
          createTableCell(
            new Paragraph({
              children: [
                new TextRun({
                  text: nameStr,
                  font: "IBM Plex Sans",
                  bold: true,
                  size: 18,
                }),
              ],
            }),
            { widthPercent: 25 }
          ),
          createTableCell(
            new Paragraph({
              children: [
                new TextRun({
                  text: `${res.enactmentScore}/100`,
                  font: "IBM Plex Mono",
                  bold: true,
                  size: 18,
                  color: "C44536",
                }),
              ],
            }),
            { widthPercent: 10 }
          ),
          createTableCell(
            new Paragraph({
              children: [
                new TextRun({
                  text: res.paradigmName,
                  font: "IBM Plex Sans",
                  size: 18,
                }),
              ],
            }),
            { widthPercent: 15 }
          ),
          createTableCell(
            new Paragraph({
              children: [
                new TextRun({
                  text: res.eachOrientation || "Emerging",
                  font: "IBM Plex Mono",
                  size: 16,
                }),
              ],
            }),
            { widthPercent: 15 }
          ),
          ...(["D1", "D2", "D3", "D4", "D5"].map((key) =>
            createTableCell(
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({
                    text: String(res.dimensions[key as DimensionKey].score),
                    font: "IBM Plex Mono",
                    size: 18,
                  }),
                ],
              }),
              { widthPercent: 7 }
            )
          )),
        ],
      })
    );
  });

  const appendixTable = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: tableRows,
  });

  elements.push(appendixTable);

  // ---------------------------------------------------------------------------
  // Build and serialize document
  // ---------------------------------------------------------------------------
  const doc = new Document({
    sections: [
      {
        properties: {},
        children: elements,
      },
    ],
  });

  return await Packer.toBuffer(doc);
}
