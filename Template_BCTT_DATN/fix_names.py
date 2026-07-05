import re

with open(r'c:\Users\caova\Downloads\BTL ATBM\Template_BCTT_DATN\settings.tex', 'r', encoding='utf-8') as f:
    content = f.read()

# Replace the 4 student blocks with a combined list
old_block = r'''\newcommand{\TenSinhVien}{NGUYỄN VIỆT HOÀNG}
\newcommand{\MaSinhVien}{1871020253}
\newcommand{\KhoaHoc}{K18}

\newcommand{\TenSinhVien}{CAO MINH HƯNG}
\newcommand{\MaSinhVien}{1871020285}
\newcommand{\KhoaHoc}{K18}

\newcommand{\TenSinhVien}{MẠC ĐỨC THẮNG}
\newcommand{\MaSinhVien}{1871020530}
\newcommand{\KhoaHoc}{K18}

\newcommand{\TenSinhVien}{LÊ HOÀNG NAM}
\newcommand{\MaSinhVien}{1871020417}
\newcommand{\KhoaHoc}{K18}'''

new_block = r'''\newcommand{\DanhSachSinhVien}{%
    \begin{tabular}{@{}l l@{}}
        NGUYỄN VIỆT HOÀNG & 1871020253 \\
        CAO MINH HƯNG      & 1871020285 \\
        MẠC ĐỨC THẮNG      & 1871020530 \\
        LÊ HOÀNG NAM       & 1871020417 \\
    \end{tabular}%
}
\newcommand{\KhoaHoc}{K18}'''

if old_block in content:
    content = content.replace(old_block, new_block)
    with open(r'c:\Users\caova\Downloads\BTL ATBM\Template_BCTT_DATN\settings.tex', 'w', encoding='utf-8') as f:
        f.write(content)
    print("settings.tex: UPDATED")
else:
    print("settings.tex: NOT FOUND")

# Fix cover.tex
with open(r'c:\Users\caova\Downloads\BTL ATBM\Template_BCTT_DATN\cover.tex', 'r', encoding='utf-8') as f:
    cover = f.read()

# First cover page
cover = cover.replace(
    '{\\bfseries\\fontsize{15pt}{18pt}\\selectfont \\TenSinhVien \\par}\n\n\\vspace{0.3cm}\n\n{\\bfseries\\fontsize{15pt}{18pt}\\selectfont MSV: \\MaSinhVien \\par}',
    '{\\bfseries\\fontsize{13pt}{16pt}\\selectfont \\DanhSachSinhVien \\par}\n\n\\vspace{0.5cm}\n\n{\\bfseries\\fontsize{15pt}{18pt}\\selectfont KHOA: \\KhoaHoc \\par}'
)

# Second cover page
cover = cover.replace(
    '{\\bfseries\\fontsize{15pt}{18pt}\\selectfont \\TenSinhVien \\par}\n\n\\vspace{0.3cm}\n\n{\\bfseries\\fontsize{15pt}{18pt}\\selectfont MSV: \\MaSinhVien, KHOA: \\KhoaHoc \\par}',
    '{\\bfseries\\fontsize{13pt}{16pt}\\selectfont \\DanhSachSinhVien \\par}\n\n\\vspace{0.5cm}\n\n{\\bfseries\\fontsize{15pt}{18pt}\\selectfont KHOA: \\KhoaHoc \\par}'
)

with open(r'c:\Users\caova\Downloads\BTL ATBM\Template_BCTT_DATN\cover.tex', 'w', encoding='utf-8') as f:
    f.write(cover)
print("cover.tex: UPDATED")
