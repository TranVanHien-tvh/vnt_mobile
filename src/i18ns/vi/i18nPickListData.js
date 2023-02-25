//Chứa danh sách các picklist cho trường hợp lười load từ dưới DB lên
//Tạm thời dùng, nếu có cập nhật picklist nhớ cập nhật thêm cái này
//TDNGHIA 29/10/2021
export default {
    //Trình độ học vấn/chuyên môn
    Qualification: [
        {
            ID: 1,
            Name: "Tiến sĩ"
        },
        {
            ID: 2,
            Name: "Tiến sĩ khoa học"
        },
        {
            ID: 3,
            Name: "Chuyên khoa II"
        },
        {
            ID: 4,
            Name: "Thạc sĩ"
        },
        {
            ID: 5,
            Name: "Chuyên khoa I"
        },
        {
            ID: 6,
            Name: "Định hướng chuyên khoa"
        },
        {
            ID: 7,
            Name: "Đại học"
        },
        {
            ID: 8,
            Name: "Cao đẳng"
        },
        {
            ID: 9,
            Name: "Trung cấp"
        },
        {
            ID: 10,
            Name: "Sơ cấp"
        },
        {
            ID: 11,
            Name: "Dưới sơ cấp"
        },
    ],

    //Học hàm
    AcademicaRank: [
        {
            ID: 1,
            Name: "Viện sĩ"
        },
        {
            ID: 2,
            Name: "Giáo sư"
        },
        {
            ID: 3,
            Name: "Phó giáo sư"
        }
    ],

    //Học vị
    AcademicaTitle: [
        {
            ID: 1,
            Name: "Tiến sĩ khoa học"
        },
        {
            ID: 2,
            Name: "Tiến sĩ"
        },
        {
            ID: 3,
            Name: "Thạc sĩ"
        }
    ],

    //kỷ luật
    Discipline: [
        {
            ID: 1,
            DisciplineType: "Khiển trách"
        },
        {
            ID: 2,
            DisciplineType: "Cảnh cáo"
        },
        {
            ID: 3,
            DisciplineType: "Hạ bậc lương"
        },
        {
            ID: 4,
            DisciplineType: "Hạ ngạch"
        },
        {
            ID: 5,
            DisciplineType: "Giáng chức"
        },
        {
            ID: 6,
            DisciplineType: "Cách chức"
        },
        {
            ID: 7,
            DisciplineType: "Buộc thôi việc"
        },
    ]
}