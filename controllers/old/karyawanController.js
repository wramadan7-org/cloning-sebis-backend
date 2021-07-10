// Membuat variabel Mahasiswa dan mengimport/required dari model Mahasiswa
const Karyawan = require("../models/Karyawan");

// Dibawah ini kita menggunakan metod export, maka semua metod yang ada di dalam object(module.exports) akan ter export
module.exports = {
  // Membuat view untuk mahasiswa
  viewKaryawan: async (req, res) => {
    try {
      // Membuat variabel mahasiswa, dan menunda eksekusi hingga proses async selesai lalu mengambil model Mahasiswa
      // dan menggunakan method find untuk mengambil semua collection/tabel yang ada di database Mahasiswa
      const karyawan = await Karyawan.find();
      // Membuat variabel untuk alertMessage  dan alertStatus
      const alertMessage = req.flash("alertMessage");
      const alertStatus = req.flash("alertStatus");
      // membuat variabel yang bersifat object dan memiliki sebuah pesan isinya mengambil dari variabel alertMessage dan alertStatus
      const alert = { message: alertMessage, status: alertStatus };
      /**
       * Lalu render viewnya yang ada di dalam file index
       * menampilkan datanya dan mendestracturkan nya, lalu memanggil variabel mahasiswa diatas
       * Lalu merender alert yang sudah di deklar di atas
       */
      res.render("index", {
        karyawan,
        alert,
        title: "CRUD", // Untuk title dari aplikasi kita, saya manamakannya dengan CRUD
      });
    } catch (error) {
      // Jika error maka akan meredirect ke route mahasiswa(routenya akan kita buat setelah selesai dengan mahasiswaController)
      res.redirect("/karyawan");
    }
  },

  // Membuat create data untuk mahasiswa
  addKaryawan: async (req, res) => {
    // memberi validasi untuk inputan yang kosong
    try {
      // Membuat contanta untuk nama, nim, jurusan, dan alamat yang diambil dari body/yang diketikan di form
      const { nama, nik, jabatan, divisi } = req.body;
      // lalu mengembalikan fungsi dan membuat data dari scheme/model Mahasiswa
      await Karyawan.create({ nama, nik, jabatan, divisi });
      // ketika create data berhasil memberikan notifikasi
      req.flash("alertMessage", "Success add data Karyawan");
      req.flash("alertStatus", "success");
      res.redirect("/karyawan"); // Setelah berhasil membuat data akan meredirect ke tujuan yang sudah ditentukan
    } catch (error) {
      // ketika create data error memberikan notifikasi
      req.flash("alertMessage", `${error.message}`);
      req.flash("alertStatus", "danger");
      // ketika inputan kosong, maka redirect kehalaman
      res.redirect("/karyawan");
    }
  },

  // Membuat read data untuk mahasiswa
  // types code in here..

  // Membuat update data untuk mahasiswa
  editKaryawan: async (req, res) => {
    try {
      // Membuat variabel yang menerima id, dan nama yang didapat dari req body atau yang di inputkan di form input
      const { id, nama, nik, jabatan, divisi } = req.body;
      /*  mencari variabel yang dideklarasikan diatas dan mengecek _id yang ada di req body yang dikirim
   _id didapat database dan id isinya dari inputan user */
      const karyawan = await Karyawan.findOne({ _id: id });
      /* mahasiswa diambil dari fungsi diatas dan titik(.) nama diambil dari database = nama yang didapat dari req body
   yang tentu dikirimkan dari inputan user */
      karyawan.nama = nama;
      karyawan.nik = nik;
      karyawan.jabatan = jabatan;
      karyawan.divisi = divisi;
      // Menyimpan datanya ke database
      await karyawan.save();
      // ketika edit data berhasill memberikan notifikasi/alert
      req.flash("alertMessage", "Success edit data karyawan");
      req.flash("alertStatus", "success");
      // Setelah berhasil maka meredirect ke tujuan yang ditentukan (/mahasiswa)
      res.redirect("/karyawan");
    } catch (error) {
      // ketika edit data error memberikan notifikasi erronya
      req.flash("alertMessage", `${error.message}`);
      req.flash("alertStatus", "danger");
      // ketika inputan kosong maka redirect kehalaman (/mahasiswa)
      res.redirect("/karyawan");
    }
  },

  // Membuat delete data untuk mahasiswa
  deleteKaryawan: async (req, res) => {
    try {
      /*
  Membuat variabel yang menerima id yang didapat dari params
  id didapat database dan id isinya dari params
  */
      const { id } = req.params;
      // cek data Mahasiswa yang mau di delete berdasarkan id
      const karyawan = await Karyawan.findOne({ _id: id });
      // setelah datanya sudah didapat maka menghapusnya
      await karyawan.remove();
      // ketika delete data memberikan notifikasi
      req.flash("alertMessage", "Success delete data karyawan");
      req.flash("alertStatus", "warning");
      // setelah berhasil remove maka melakukan redirect
      res.redirect("/karyawan");
    } catch (error) {
      // ketika create data error memberikan notifikasi
      req.flash("alertMessage", `${error.message}`);
      req.flash("alertStatus", "danger");
      // ketika inputa kosong redirect kehalaman
      res.redirect("/karyawan");
    }
  },
  
  /* END OF METHOD KARYAWAN	*/
};