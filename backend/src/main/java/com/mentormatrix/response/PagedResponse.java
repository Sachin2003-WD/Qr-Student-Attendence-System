package com.mentormatrix.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PagedResponse<T> {
    private List<T> content;
    private int pageNumber;
    private int pageSize;
    private long totalElements;
    private int totalPages;
    private boolean last;

    public List<T> getContent() { return content; }
    public void setContent(List<T> content) { this.content = content; }
    public int getPageNumber() { return pageNumber; }
    public void setPageNumber(int pageNumber) { this.pageNumber = pageNumber; }
    public int getPageSize() { return pageSize; }
    public void setPageSize(int pageSize) { this.pageSize = pageSize; }
    public long getTotalElements() { return totalElements; }
    public void setTotalElements(long totalElements) { this.totalElements = totalElements; }
    public int getTotalPages() { return totalPages; }
    public void setTotalPages(int totalPages) { this.totalPages = totalPages; }
    public boolean isLast() { return last; }
    public void setLast(boolean last) { this.last = last; }

    public static <T> PagedResponseBuilder<T> builder() {
        return new PagedResponseBuilder<T>();
    }

    public static class PagedResponseBuilder<T> {
        private List<T> content;
        private int pageNumber;
        private int pageSize;
        private long totalElements;
        private int totalPages;
        private boolean last;

        public PagedResponseBuilder<T> content(List<T> content) { this.content = content; return this; }
        public PagedResponseBuilder<T> pageNumber(int pageNumber) { this.pageNumber = pageNumber; return this; }
        public PagedResponseBuilder<T> pageSize(int pageSize) { this.pageSize = pageSize; return this; }
        public PagedResponseBuilder<T> totalElements(long totalElements) { this.totalElements = totalElements; return this; }
        public PagedResponseBuilder<T> totalPages(int totalPages) { this.totalPages = totalPages; return this; }
        public PagedResponseBuilder<T> last(boolean last) { this.last = last; return this; }

        public PagedResponse<T> build() {
            PagedResponse<T> p = new PagedResponse<>();
            p.setContent(content);
            p.setPageNumber(pageNumber);
            p.setPageSize(pageSize);
            p.setTotalElements(totalElements);
            p.setTotalPages(totalPages);
            p.setLast(last);
            return p;
        }
    }
}
