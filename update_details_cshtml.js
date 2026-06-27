const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'CMS.Backend/Views/Order/Details.cshtml');
let content = fs.readFileSync(filePath, 'utf8');

// Replace card header
const headerTarget = `<div class="th-card-header" style="background-color: #FDFBFA; border-bottom: 1px solid var(--th-border);">
            Danh Sách Sản Phẩm Đã Đặt
        </div>`;
const headerRep = `<div class="th-card-header d-flex justify-content-between align-items-center" style="background-color: #FDFBFA; border-bottom: 1px solid var(--th-border);">
            <span>Danh Sách Sản Phẩm Đã Đặt</span>
            <button class="th-btn" style="background-color: var(--th-primary); color: white; height: 36px; padding: 0 16px;" data-bs-toggle="modal" data-bs-target="#sendMessageModal">
                <i class="bi bi-chat-dots"></i> Gửi thông báo cho khách
            </button>
        </div>`;
content = content.replace(headerTarget, headerRep);

// Replace table header
const thTarget = `<th style="width:200px; text-align:right;">Thành tiền</th>
                    </tr>`;
const thRep = `<th style="width:200px; text-align:right;">Thành tiền</th>
                        <th style="width:100px; text-align:center;">Thao tác</th>
                    </tr>`;
content = content.replace(thTarget, thRep);

// Replace td
const tdTarget = `<td class="text-end fw-bold text-danger" style="font-size: 15px;">@subtotal.ToString("N0") VNĐ</td>
                            </tr>`;
const tdRep = `<td class="text-end fw-bold text-danger" style="font-size: 15px;">@subtotal.ToString("N0") VNĐ</td>
                                <td class="text-center">
                                    <button type="button" class="btn btn-sm btn-outline-primary" style="margin-right:4px;" onclick="openEditModal(@Model.Id, @detail.Id, @detail.Quantity)">
                                        <i class="bi bi-pencil"></i>
                                    </button>
                                    <form asp-action="DeleteDetail" method="post" class="d-inline">
                                        <input type="hidden" name="orderId" value="@Model.Id" />
                                        <input type="hidden" name="detailId" value="@detail.Id" />
                                        <button type="submit" class="btn btn-sm btn-outline-danger" onclick="return confirm('Bạn có chắc muốn xóa sản phẩm này khỏi đơn hàng?');">
                                            <i class="bi bi-trash"></i>
                                        </button>
                                    </form>
                                </td>
                            </tr>`;
content = content.replace(tdTarget, tdRep);

// Adjust colspans
const colspanTarget1 = `<td colspan="6" class="text-center text-muted p-5">`;
const colspanRep1 = `<td colspan="7" class="text-center text-muted p-5">`;
content = content.replace(colspanTarget1, colspanRep1);

const colspanTarget2 = `<td colspan="5" class="text-end fw-bold" style="font-size: 16px; color: var(--th-text-main);">TỔNG CỘNG:</td>`;
const colspanRep2 = `<td colspan="5" class="text-end fw-bold" style="font-size: 16px; color: var(--th-text-main);">TỔNG CỘNG:</td>`; // Keep 5, the 6th is total, 7th is empty. Wait, the colspan needs to align.
// Th1: STT, Th2: Ảnh, Th3: Tên, Th4: Đơn giá, Th5: Số lượng, Th6: Thành tiền, Th7: Thao tác.
// TỔNG CỘNG colspan should be 5.
const tfootTarget = `<tfoot>
                    <tr>
                        <td colspan="5" class="text-end fw-bold" style="font-size: 16px; color: var(--th-text-main);">TỔNG CỘNG:</td>
                        <td class="text-end fw-bold text-danger" style="font-size: 20px;">@totalAmount.ToString("N0") VNĐ</td>
                    </tr>
                </tfoot>`;
const tfootRep = `<tfoot>
                    <tr>
                        <td colspan="5" class="text-end fw-bold" style="font-size: 16px; color: var(--th-text-main);">TỔNG CỘNG:</td>
                        <td class="text-end fw-bold text-danger" style="font-size: 20px;">@totalAmount.ToString("N0") VNĐ</td>
                        <td></td>
                    </tr>
                </tfoot>`;
content = content.replace(tfootTarget, tfootRep);

// Append modals
const modals = `

<!-- Modal Send Message -->
<div class="modal fade" id="sendMessageModal" tabindex="-1" aria-labelledby="sendMessageModalLabel" aria-hidden="true">
    <div class="modal-dialog">
        <form asp-action="SendMessage" method="post">
            <input type="hidden" name="orderId" value="@Model.Id" />
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title" id="sendMessageModalLabel">Gửi thông báo cho khách hàng</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body">
                    <div class="mb-3">
                        <label for="message" class="form-label">Nội dung thông báo (VD: Xin lỗi, sản phẩm bị lỗi kho không đủ hàng. Bạn có muốn giảm số lượng hay hủy đơn?)</label>
                        <textarea class="form-control" id="message" name="message" rows="4" required></textarea>
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Hủy</button>
                    <button type="submit" class="btn btn-primary" style="background-color: var(--th-primary); border-color: var(--th-primary);">Gửi thông báo</button>
                </div>
            </div>
        </form>
    </div>
</div>

<!-- Modal Edit Detail -->
<div class="modal fade" id="editDetailModal" tabindex="-1" aria-labelledby="editDetailModalLabel" aria-hidden="true">
    <div class="modal-dialog modal-sm">
        <form asp-action="EditDetail" method="post">
            <input type="hidden" name="orderId" value="@Model.Id" />
            <input type="hidden" name="detailId" id="editDetailId" value="" />
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title" id="editDetailModalLabel">Cập nhật số lượng</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body">
                    <div class="mb-3">
                        <label for="newQuantity" class="form-label">Số lượng mới</label>
                        <input type="number" class="form-control" id="newQuantity" name="newQuantity" min="1" required />
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Hủy</button>
                    <button type="submit" class="btn btn-primary">Lưu thay đổi</button>
                </div>
            </div>
        </form>
    </div>
</div>

<script>
    function openEditModal(orderId, detailId, currentQuantity) {
        document.getElementById('editDetailId').value = detailId;
        document.getElementById('newQuantity').value = currentQuantity;
        var editModal = new bootstrap.Modal(document.getElementById('editDetailModal'));
        editModal.show();
    }
</script>
`;

content = content + modals;

fs.writeFileSync(filePath, content, 'utf8');
console.log("Updated Details.cshtml successfully!");
