// ============================================
// RESUME GENERATOR - DOCX & PDF Export
// ============================================

import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  AlignmentType,
  TabStopPosition,
  TabStopType,
  BorderStyle,
  convertInchesToTwip,
  PageBreak,
  ExternalHyperlink,
  Table,
  TableCell,
  TableRow,
  WidthType,
} from 'docx';
import { saveAs } from 'file-saver';
import { ResumeData, ResumeSections, ExportConfig } from './types';

class ResumeGenerator {
  private static instance: ResumeGenerator;

  static getInstance(): ResumeGenerator {
    if (!ResumeGenerator.instance) {
      ResumeGenerator.instance = new ResumeGenerator();
    }
    return ResumeGenerator.instance;
  }

  // ============================================
  // DOCX GENERATION
  // ============================================

  async generateDOCX(resume: ResumeData, config: ExportConfig): Promise<Blob> {
    try {
      const sections = resume.sections;
      const template = resume.metadata.templateId;

      const doc = new Document({
        styles: {
          default: {
            document: {
              run: {
                font: 'Calibri',
                size: 22, // 11pt
              },
            },
          },
        },
        sections: [
          {
            properties: {
              page: {
                margin: {
                  top: convertInchesToTwip(0.5),
                  right: convertInchesToTwip(0.75),
                  bottom: convertInchesToTwip(0.5),
                  left: convertInchesToTwip(0.75),
                },
              },
            },
            children: [
              ...this.createHeader(sections),
              ...this.createSummary(sections),
              ...this.createExperience(sections),
              ...this.createEducation(sections),
              ...this.createSkills(sections),
              ...this.createCertifications(sections),
              ...this.createProjects(sections),
              ...this.createCustomSections(sections),
            ],
          },
        ],
      });

      const blob = await Packer.toBlob(doc);
      return blob;
    } catch (error: any) {
      console.error('DOCX Generation Error:', error);
      throw new Error(`Failed to generate DOCX: ${error.message}`);
    }
  }

  // ============================================
  // HEADER - CONTACT INFORMATION
  // ============================================

  private createHeader(sections: ResumeSections): Paragraph[] {
    const contact = sections.contact;
    const paragraphs: Paragraph[] = [];

    // Name
    paragraphs.push(
      new Paragraph({
        text: contact.fullName || 'Your Name',
        heading: HeadingLevel.TITLE,
        alignment: AlignmentType.CENTER,
        spacing: { after: 120 },
        run: {
          size: 48, // 24pt
          bold: true,
          color: '1F2937',
        },
      })
    );

    // Contact details
    const contactDetails: string[] = [];
    if (contact.email) contactDetails.push(contact.email);
    if (contact.phone) contactDetails.push(contact.phone);
    if (contact.location) contactDetails.push(contact.location);
    if (contact.linkedIn) contactDetails.push(contact.linkedIn);
    if (contact.github) contactDetails.push(contact.github);
    if (contact.portfolio) contactDetails.push(contact.portfolio);

    paragraphs.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 200 },
        children: contactDetails.flatMap((detail, index) => {
          const runs: TextRun[] = [
            new TextRun({
              text: detail,
              size: 20, // 10pt
              color: '4B5563',
            }),
          ];
          if (index < contactDetails.length - 1) {
            runs.push(
              new TextRun({
                text: ' | ',
                size: 20,
                color: '9CA3AF',
              })
            );
          }
          return runs;
        }),
      })
    );

    // Separator line
    paragraphs.push(
      new Paragraph({
        spacing: { after: 200 },
        border: {
          bottom: {
            color: 'E5E7EB',
            space: 1,
            style: BorderStyle.SINGLE,
            size: 6,
          },
        },
        children: [],
      })
    );

    return paragraphs;
  }

  // ============================================
  // PROFESSIONAL SUMMARY
  // ============================================

  private createSummary(sections: ResumeSections): Paragraph[] {
    const paragraphs: Paragraph[] = [];

    if (sections.summary?.content) {
      paragraphs.push(
        new Paragraph({
          heading: HeadingLevel.HEADING_2,
          text: 'PROFESSIONAL SUMMARY',
          spacing: { before: 200, after: 100 },
          run: {
            size: 24,
            bold: true,
            color: '1F2937',
            font: 'Calibri',
          },
        })
      );

      paragraphs.push(
        new Paragraph({
          text: sections.summary.content,
          spacing: { after: 200 },
          run: {
            size: 22,
            color: '374151',
          },
        })
      );
    }

    return paragraphs;
  }

  // ============================================
  // WORK EXPERIENCE
  // ============================================

  private createExperience(sections: ResumeSections): Paragraph[] {
    const paragraphs: Paragraph[] = [];

    if (sections.experience?.length > 0) {
      paragraphs.push(
        new Paragraph({
          heading: HeadingLevel.HEADING_2,
          text: 'PROFESSIONAL EXPERIENCE',
          spacing: { before: 200, after: 100 },
          run: {
            size: 24,
            bold: true,
            color: '1F2937',
          },
          border: {
            bottom: {
              color: 'E5E7EB',
              space: 1,
              style: BorderStyle.SINGLE,
              size: 6,
            },
          },
        })
      );

      sections.experience.forEach((exp) => {
        // Company and Position
        paragraphs.push(
          new Paragraph({
            spacing: { before: 150, after: 50 },
            children: [
              new TextRun({
                text: exp.position,
                bold: true,
                size: 22,
                color: '111827',
              }),
              new TextRun({
                text: ` | ${exp.company}`,
                size: 22,
                color: '374151',
              }),
            ],
          })
        );

        // Dates and Location
        const dateLocation = [
          `${exp.startDate} - ${exp.current ? 'Present' : exp.endDate}`,
          exp.location,
        ]
          .filter(Boolean)
          .join(' | ');

        paragraphs.push(
          new Paragraph({
            spacing: { after: 100 },
            children: [
              new TextRun({
                text: dateLocation,
                size: 20,
                italics: true,
                color: '6B7280',
              }),
            ],
          })
        );

        // Description
        if (exp.description) {
          paragraphs.push(
            new Paragraph({
              text: exp.description,
              spacing: { after: 50 },
              run: {
                size: 22,
                color: '374151',
              },
            })
          );
        }

        // Achievements
        if (exp.achievements?.length > 0) {
          exp.achievements.forEach((achievement) => {
            paragraphs.push(
              new Paragraph({
                text: `• ${achievement}`,
                spacing: { after: 30 },
                indent: { left: 360 },
                run: {
                  size: 22,
                  color: '374151',
                },
              })
            );
          });
        }
      });
    }

    return paragraphs;
  }

  // ============================================
  // EDUCATION
  // ============================================

  private createEducation(sections: ResumeSections): Paragraph[] {
    const paragraphs: Paragraph[] = [];

    if (sections.education?.length > 0) {
      paragraphs.push(
        new Paragraph({
          heading: HeadingLevel.HEADING_2,
          text: 'EDUCATION',
          spacing: { before: 300, after: 100 },
          run: {
            size: 24,
            bold: true,
            color: '1F2937',
          },
          border: {
            bottom: {
              color: 'E5E7EB',
              space: 1,
              style: BorderStyle.SINGLE,
              size: 6,
            },
          },
        })
      );

      sections.education.forEach((edu) => {
        paragraphs.push(
          new Paragraph({
            spacing: { before: 100, after: 50 },
            children: [
              new TextRun({
                text: `${edu.degree} in ${edu.field}`,
                bold: true,
                size: 22,
                color: '111827',
              }),
            ],
          })
        );

        paragraphs.push(
          new Paragraph({
            spacing: { after: 50 },
            children: [
              new TextRun({
                text: edu.institution,
                size: 22,
                color: '374151',
              }),
              new TextRun({
                text: ` | ${edu.startDate} - ${edu.endDate}`,
                size: 20,
                italics: true,
                color: '6B7280',
              }),
            ],
          })
        );

        if (edu.gpa) {
          paragraphs.push(
            new Paragraph({
              text: `GPA: ${edu.gpa}`,
              spacing: { after: 50 },
              run: {
                size: 20,
                color: '6B7280',
              },
            })
          );
        }

        if (edu.honors?.length > 0) {
          paragraphs.push(
            new Paragraph({
              text: `Honors: ${edu.honors.join(', ')}`,
              spacing: { after: 50 },
              run: {
                size: 20,
                color: '6B7280',
              },
            })
          );
        }
      });
    }

    return paragraphs;
  }

  // ============================================
  // SKILLS
  // ============================================

  private createSkills(sections: ResumeSections): Paragraph[] {
    const paragraphs: Paragraph[] = [];

    const allSkills = [
      ...(sections.skills?.technical || []),
      ...(sections.skills?.soft || []),
      ...(sections.skills?.tools || []),
    ];

    if (allSkills.length > 0) {
      paragraphs.push(
        new Paragraph({
          heading: HeadingLevel.HEADING_2,
          text: 'SKILLS',
          spacing: { before: 300, after: 100 },
          run: {
            size: 24,
            bold: true,
            color: '1F2937',
          },
          border: {
            bottom: {
              color: 'E5E7EB',
              space: 1,
              style: BorderStyle.SINGLE,
              size: 6,
            },
          },
        })
      );

      // Technical Skills
      if (sections.skills?.technical?.length > 0) {
        paragraphs.push(
          new Paragraph({
            text: `Technical: ${sections.skills.technical.map(s => s.name).join(', ')}`,
            spacing: { after: 50 },
            run: {
              size: 22,
              color: '374151',
            },
          })
        );
      }

      // Soft Skills
      if (sections.skills?.soft?.length > 0) {
        paragraphs.push(
          new Paragraph({
            text: `Soft Skills: ${sections.skills.soft.map(s => s.name).join(', ')}`,
            spacing: { after: 50 },
            run: {
              size: 22,
              color: '374151',
            },
          })
        );
      }

      // Tools
      if (sections.skills?.tools?.length > 0) {
        paragraphs.push(
          new Paragraph({
            text: `Tools: ${sections.skills.tools.map(s => s.name).join(', ')}`,
            spacing: { after: 50 },
            run: {
              size: 22,
              color: '374151',
            },
          })
        );
      }
    }

    return paragraphs;
  }

  // ============================================
  // CERTIFICATIONS
  // ============================================

  private createCertifications(sections: ResumeSections): Paragraph[] {
    const paragraphs: Paragraph[] = [];

    if (sections.certifications?.length > 0) {
      paragraphs.push(
        new Paragraph({
          heading: HeadingLevel.HEADING_2,
          text: 'CERTIFICATIONS',
          spacing: { before: 300, after: 100 },
          run: {
            size: 24,
            bold: true,
            color: '1F2937',
          },
          border: {
            bottom: {
              color: 'E5E7EB',
              space: 1,
              style: BorderStyle.SINGLE,
              size: 6,
            },
          },
        })
      );

      sections.certifications.forEach((cert) => {
        paragraphs.push(
          new Paragraph({
            spacing: { after: 50 },
            children: [
              new TextRun({
                text: `• ${cert.name}`,
                size: 22,
                color: '374151',
              }),
              cert.issuer
                ? new TextRun({
                    text: ` - ${cert.issuer}`,
                    size: 20,
                    italics: true,
                    color: '6B7280',
                  })
                : new TextRun({}),
            ],
          })
        );
      });
    }

    return paragraphs;
  }

  // ============================================
  // PROJECTS
  // ============================================

  private createProjects(sections: ResumeSections): Paragraph[] {
    const paragraphs: Paragraph[] = [];

    if (sections.projects?.length > 0) {
      paragraphs.push(
        new Paragraph({
          heading: HeadingLevel.HEADING_2,
          text: 'PROJECTS',
          spacing: { before: 300, after: 100 },
          run: {
            size: 24,
            bold: true,
            color: '1F2937',
          },
          border: {
            bottom: {
              color: 'E5E7EB',
              space: 1,
              style: BorderStyle.SINGLE,
              size: 6,
            },
          },
        })
      );

      sections.projects.forEach((project) => {
        paragraphs.push(
          new Paragraph({
            spacing: { before: 100, after: 30 },
            children: [
              new TextRun({
                text: project.name,
                bold: true,
                size: 22,
                color: '111827',
              }),
              project.technologies?.length
                ? new TextRun({
                    text: ` | ${project.technologies.join(', ')}`,
                    size: 20,
                    italics: true,
                    color: '6B7280',
                  })
                : new TextRun({}),
            ],
          })
        );

        if (project.description) {
          paragraphs.push(
            new Paragraph({
              text: project.description,
              spacing: { after: 50 },
              indent: { left: 360 },
              run: {
                size: 22,
                color: '374151',
              },
            })
          );
        }
      });
    }

    return paragraphs;
  }

  // ============================================
  // CUSTOM SECTIONS
  // ============================================

  private createCustomSections(sections: ResumeSections): Paragraph[] {
    const paragraphs: Paragraph[] = [];

    if (sections.customSections?.length > 0) {
      sections.customSections.forEach((section) => {
        paragraphs.push(
          new Paragraph({
            heading: HeadingLevel.HEADING_2,
            text: section.title.toUpperCase(),
            spacing: { before: 300, after: 100 },
            run: {
              size: 24,
              bold: true,
              color: '1F2937',
            },
            border: {
              bottom: {
                color: 'E5E7EB',
                space: 1,
                style: BorderStyle.SINGLE,
                size: 6,
              },
            },
          })
        );

        section.items.forEach((item) => {
          paragraphs.push(
            new Paragraph({
              spacing: { before: 100, after: 50 },
              children: [
                new TextRun({
                  text: item.title,
                  bold: true,
                  size: 22,
                  color: '111827',
                }),
                item.subtitle
                  ? new TextRun({
                      text: ` | ${item.subtitle}`,
                      size: 20,
                      italics: true,
                      color: '6B7280',
                    })
                  : new TextRun({}),
              ],
            })
          );

          if (item.description) {
            paragraphs.push(
              new Paragraph({
                text: item.description,
                spacing: { after: 50 },
                indent: { left: 360 },
                run: {
                  size: 22,
                  color: '374151',
                },
              })
            );
          }

          item.bulletPoints?.forEach((point) => {
            paragraphs.push(
              new Paragraph({
                text: `• ${point}`,
                spacing: { after: 30 },
                indent: { left: 360 },
                run: {
                  size: 22,
                  color: '374151',
                },
              })
            );
          });
        });
      });
    }

    return paragraphs;
  }

  // ============================================
  // PDF GENERATION
  // ============================================

  async generatePDF(resume: ResumeData, config: ExportConfig): Promise<Blob> {
    try {
      // Use html2canvas and jsPDF for PDF generation
      const html2canvas = (await import('html2canvas')).default;
      const jsPDF = (await import('jspdf')).default;

      // Create a temporary div for rendering
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = this.generateHTML(resume);
      tempDiv.style.position = 'absolute';
      tempDiv.style.left = '-9999px';
      tempDiv.style.width = '210mm'; // A4 width
      document.body.appendChild(tempDiv);

      // Capture the div as canvas
      const canvas = await html2canvas(tempDiv, {
        scale: 2,
        useCORS: true,
        logging: false,
      });

      // Remove temporary div
      document.body.removeChild(tempDiv);

      // Create PDF
      const imgWidth = 210; // A4 width in mm
      const pageHeight = 297; // A4 height in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      const pdf = new jsPDF('p', 'mm', 'a4');
      pdf.addImage(
        canvas.toDataURL('image/png'),
        'PNG',
        0,
        position,
        imgWidth,
        imgHeight
      );
      heightLeft -= pageHeight;

      // Add new pages if content overflows
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(
          canvas.toDataURL('image/png'),
          'PNG',
          0,
          position,
          imgWidth,
          imgHeight
        );
        heightLeft -= pageHeight;
      }

      return pdf.output('blob');
    } catch (error: any) {
      console.error('PDF Generation Error:', error);
      throw new Error(`Failed to generate PDF: ${error.message}`);
    }
  }

  // ============================================
  // HTML GENERATION (for PDF)
  // ============================================

  private generateHTML(resume: ResumeData): string {
    const sections = resume.sections;
    
    return `
      <div style="font-family: Arial, sans-serif; max-width: 210mm; padding: 20px; color: #333;">
        <div style="text-align: center; margin-bottom: 20px;">
          <h1 style="font-size: 24px; margin: 0; color: #1a1a1a;">${sections.contact.fullName}</h1>
          <p style="font-size: 12px; color: #666; margin: 5px 0;">
            ${sections.contact.email} | ${sections.contact.phone} | ${sections.contact.location}
          </p>
        </div>
        <hr style="border: 1px solid #e5e7eb;" />
        
        ${sections.summary?.content ? `
          <h2 style="font-size: 16px; color: #1a1a1a; margin-top: 20px;">PROFESSIONAL SUMMARY</h2>
          <p style="font-size: 12px; line-height: 1.5;">${sections.summary.content}</p>
        ` : ''}
        
        ${sections.experience?.map(exp => `
          <h2 style="font-size: 16px; color: #1a1a1a; margin-top: 20px;">PROFESSIONAL EXPERIENCE</h2>
          <div style="margin-bottom: 15px;">
            <strong>${exp.position}</strong> | ${exp.company}<br />
            <em style="color: #666;">${exp.startDate} - ${exp.current ? 'Present' : exp.endDate}</em><br />
            ${exp.description ? `<p style="font-size: 12px;">${exp.description}</p>` : ''}
            ${exp.achievements?.map(ach => `<li style="font-size: 12px;">${ach}</li>`).join('')}
          </div>
        `).join('') || ''}
        
        ${sections.education?.map(edu => `
          <h2 style="font-size: 16px; color: #1a1a1a; margin-top: 20px;">EDUCATION</h2>
          <div style="margin-bottom: 15px;">
            <strong>${edu.degree} in ${edu.field}</strong><br />
            ${edu.institution}<br />
            <em style="color: #666;">${edu.startDate} - ${edu.endDate}</em>
          </div>
        `).join('') || ''}
      </div>
    `;
  }

  // ============================================
  // DOWNLOAD METHODS
  // ============================================

  async downloadResume(
    resume: ResumeData,
    config: ExportConfig
  ): Promise<void> {
    try {
      let blob: Blob;
      let filename: string;

      switch (config.format) {
        case 'docx':
          blob = await this.generateDOCX(resume, config);
          filename = `${resume.metadata.title || 'resume'}.docx`;
          break;
        case 'pdf':
          blob = await this.generatePDF(resume, config);
          filename = `${resume.metadata.title || 'resume'}.pdf`;
          break;
        case 'txt':
          blob = new Blob([this.generateTXT(resume)], {
            type: 'text/plain;charset=utf-8',
          });
          filename = `${resume.metadata.title || 'resume'}.txt`;
          break;
        default:
          throw new Error(`Unsupported format: ${config.format}`);
      }

      saveAs(blob, filename);
    } catch (error: any) {
      console.error('Download Error:', error);
      throw error;
    }
  }

  private generateTXT(resume: ResumeData): string {
    const sections = resume.sections;
    let text = '';

    text += `${sections.contact.fullName}\n`;
    text += `${sections.contact.email} | ${sections.contact.phone} | ${sections.contact.location}\n`;
    text += '='.repeat(50) + '\n\n';

    if (sections.summary?.content) {
      text += 'PROFESSIONAL SUMMARY\n';
      text += '-'.repeat(25) + '\n';
      text += sections.summary.content + '\n\n';
    }

    if (sections.experience?.length) {
      text += 'PROFESSIONAL EXPERIENCE\n';
      text += '-'.repeat(25) + '\n';
      sections.experience.forEach(exp => {
        text += `${exp.position} at ${exp.company}\n`;
        text += `${exp.startDate} - ${exp.current ? 'Present' : exp.endDate}\n`;
        if (exp.description) text += `${exp.description}\n`;
        exp.achievements?.forEach(ach => {
          text += `• ${ach}\n`;
        });
        text += '\n';
      });
    }

    return text;
  }
}

export default ResumeGenerator;