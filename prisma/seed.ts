import bcrypt from "bcryptjs";
import {
  PrismaClient,
  ProductBrand,
  ProductCategory,
  BadgeVariant,
} from "@prisma/client";

const prisma = new PrismaClient();

const PLACEHOLDER = (seed: string) =>
  `https://images.unsplash.com/photo-${seed}?w=800&q=80`;

type ProductSeed = {
  slug: string;
  name: string;
  collection: string;
  badge?: string;
  priceAmount: number;
  originalPriceAmount?: number;
  discountPercent?: number;
  description: string;
  listDescription: string;
  category: ProductCategory;
  brand: ProductBrand;
  listBadgeLabel?: string;
  listBadgeVariant?: BadgeVariant;
  stock: number;
  imageSeed: string;
  colors?: Array<{ name: string; hexOrClass: string }>;
  specs?: Array<{ label: string; value: string }>;
};

const products: ProductSeed[] = [
  {
    slug: "royal-edition",
    name: "عطر \"الإصدار الملكي\"",
    collection: "مجموعة كلاسيك",
    badge: "إصدار محدود",
    priceAmount: 4200,
    originalPriceAmount: 5200,
    discountPercent: 19,
    description: "عطر فاخر يجمع بين نotes العود الكамбودي والمسك الأبيض.",
    listDescription: "عود كамбودي أصيل مع لمسات مسك فاخرة",
    category: "PERFUMES",
    brand: "TARAF_COLLECTION",
    listBadgeLabel: "حصري",
    listBadgeVariant: "PRIMARY",
    stock: 45,
    imageSeed: "1615634208120-6b972854b826",
    specs: [
      { label: "الحجم", value: "100 مل" },
      { label: "التركيز", value: "Eau de Parfum" },
    ],
  },
  {
    slug: "nebula-gold",
    name: "ساعة \"السديم\" المذهبة",
    collection: "مجموعة الساعات",
    priceAmount: 4500,
    description: "ساعة فاخرة بتصميم عصري مرصعة بتفاصيل ذهبية.",
    listDescription: "إصدار محدود مرصع بتفاصيل ذهبية",
    category: "WATCHES",
    brand: "TARAF_COLLECTION",
    listBadgeLabel: "جديد",
    listBadgeVariant: "SECONDARY",
    stock: 12,
    imageSeed: "1523275335684-37898b6baf30",
  },
  {
    slug: "aurora-sneaker",
    name: "حذاء \"أورورا\" الرياضي",
    collection: "مجموعة أور",
    priceAmount: 1250,
    description: "حذاء رياضي فاخر من الجلد الطبيعي بتصميم عصري.",
    listDescription: "إصدار محدود • جلد طبيعي",
    category: "ACCESSORIES",
    brand: "ORAD",
    stock: 30,
    imageSeed: "1542291026-7eec264c27ff",
  },
  {
    slug: "diamond-clutch",
    name: "حقيبة \"الماس\" اليدوية",
    collection: "مجموعة حقائب",
    priceAmount: 3800,
    description: "حقيبة يد فاخرة مزينة بتفاصيل كريستالية.",
    listDescription: "تصميم مسائي فاخر",
    category: "BAGS",
    brand: "UNIQUE_DIAMOND",
    stock: 18,
    imageSeed: "1584917860317-47f9d2b5e8a1",
  },
  {
    slug: "oud-noir",
    name: "عطر \"عود نوار\"",
    collection: "مجموعة العود",
    priceAmount: 2900,
    description: "عود داكن عميق مع قاعدة عنبرية دافئة.",
    listDescription: "عود داكن بلمسة عنبرية",
    category: "PERFUMES",
    brand: "UNIQUE_DIAMOND",
    stock: 60,
    imageSeed: "1594035914469-39a4aad44608",
  },
  {
    slug: "crescent-watch",
    name: "ساعة \"الهلال\"",
    collection: "مجموعة الساعات",
    priceAmount: 6200,
    description: "ساعة سويسرية بتصميم الهلال العربي.",
    listDescription: "آلية سويسرية • إصدار حصري",
    category: "WATCHES",
    brand: "UNIQUE_DIAMOND",
    listBadgeLabel: "VIP",
    listBadgeVariant: "PRIMARY",
    stock: 8,
    imageSeed: "1587836371336-765223461f46",
  },
  {
    slug: "desert-rose-bag",
    name: "حقيبة \"وردة الصحراء\"",
    collection: "مجموعة حقائب",
    priceAmount: 5100,
    description: "حقيبة جلدية فاخرة بلون وردي التراب.",
    listDescription: "جلد إيطالي فاخر",
    category: "BAGS",
    brand: "TARAF_COLLECTION",
    stock: 22,
    imageSeed: "1590871190947-2e947ce1d2d7",
  },
  {
    slug: "pearl-scarf",
    name: "وشاح \"اللؤلؤ\"",
    collection: "مجموعة إكسسوارات",
    priceAmount: 890,
    description: "وشاح حريري فاخر بتطريز لؤlؤي.",
    listDescription: "حرير طبيعي 100%",
    category: "ACCESSORIES",
    brand: "ORAD",
    stock: 55,
    imageSeed: "1601924992603-554162600f6d",
  },
  {
    slug: "midnight-perfume",
    name: "عطر \"منتصف الليل\"",
    collection: "مجموعة كلاسيك",
    priceAmount: 3400,
    description: "عطر ليلي فاخر بنفحات مسك وعنبر.",
    listDescription: "مسك وعنبر • تركيز عالي",
    category: "PERFUMES",
    brand: "ORAD",
    stock: 40,
    imageSeed: "1619994409905-3e733628c1f0",
  },
  {
    slug: "gold-bracelet",
    name: "سوار \"الذهب العربي\"",
    collection: "مجموعة إكسسوارات",
    priceAmount: 7800,
    description: "سوار ذهبي بتصميم عربي أصيل.",
    listDescription: "ذهب 18 قيراط",
    category: "ACCESSORIES",
    brand: "UNIQUE_DIAMOND",
    stock: 10,
    imageSeed: "1611596465820-ca4977049a70",
  },
  {
    slug: "velvet-tote",
    name: "حقيبة \"مخمل\"",
    collection: "مجموعة حقائب",
    priceAmount: 2950,
    description: "حقيبة tote فاخرة من المخمل الإيطالي.",
    listDescription: "مخمل إيطالي • تصميم يومي",
    category: "BAGS",
    brand: "ORAD",
    stock: 35,
    imageSeed: "1591561958458-786cfe247608",
  },
  {
    slug: "heritage-watch",
    name: "ساعة \"التراث\"",
    collection: "مجموعة الساعات",
    priceAmount: 8900,
    description: "ساعة تراثية فاخرة بإطار من الذهب الوردي.",
    listDescription: "ذهب وردي • إصدار تراثي",
    category: "WATCHES",
    brand: "TARAF_COLLECTION",
    badge: "إصدار محدود",
    stock: 5,
    imageSeed: "1524593366635-4de242c4a169",
  },
];

async function main() {
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.cartItem.deleteMany();
  await prisma.cart.deleteMany();
  await prisma.review.deleteMany();
  await prisma.favorite.deleteMany();
  await prisma.productRelation.deleteMany();
  await prisma.collectionProduct.deleteMany();
  await prisma.productImage.deleteMany();
  await prisma.productColor.deleteMany();
  await prisma.productSpec.deleteMany();
  await prisma.inventoryAlert.deleteMany();
  await prisma.product.deleteMany();
  await prisma.collection.deleteMany();
  await prisma.address.deleteMany();
  await prisma.refreshToken.deleteMany();
  await prisma.newsletterSubscription.deleteMany();
  await prisma.user.deleteMany();
  await prisma.homeContent.deleteMany();

  const passwordHash = await bcrypt.hash("Password123!", 12);

  const admin = await prisma.user.create({
    data: {
      email: "admin@taraf.sa",
      passwordHash,
      name: "مدير ترف",
      phone: "+966500000001",
      role: "ADMIN",
      loyaltyPoints: 20000,
      membershipTier: "ELITE",
    },
  });

  const customer = await prisma.user.create({
    data: {
      email: "customer@taraf.sa",
      passwordHash,
      name: "سارة العتيبي",
      phone: "+966501234567",
      role: "CUSTOMER",
      loyaltyPoints: 8500,
      membershipTier: "STANDARD",
    },
  });

  await prisma.address.create({
    data: {
      userId: customer.id,
      label: "المنزل",
      icon: "HOME",
      line1: "حي النرجس، شارع الأمير سلطان",
      city: "الرياض",
      country: "SA",
      isDefault: true,
    },
  });

  const createdProducts = [];
  for (const p of products) {
    const product = await prisma.product.create({
      data: {
        slug: p.slug,
        name: p.name,
        collection: p.collection,
        badge: p.badge,
        priceAmount: p.priceAmount,
        originalPriceAmount: p.originalPriceAmount,
        discountPercent: p.discountPercent,
        description: p.description,
        listDescription: p.listDescription,
        category: p.category,
        brand: p.brand,
        listBadgeLabel: p.listBadgeLabel,
        listBadgeVariant: p.listBadgeVariant,
        stock: p.stock,
        averageRating: 4.5,
        reviewCount: 12,
        isFeatured: p.stock < 15,
        images: {
          create: [
            {
              src: PLACEHOLDER(p.imageSeed),
              alt: p.name,
              sortOrder: 0,
            },
          ],
        },
        colors: p.colors
          ? { create: p.colors }
          : {
              create: [
                { name: "ذهبي", hexOrClass: "#C5A572" },
                { name: "أسود", hexOrClass: "#1A1A1A" },
              ],
            },
        specs: p.specs
          ? { create: p.specs }
          : {
              create: [{ label: "المنشأ", value: "المملكة العربية السعودية" }],
            },
      },
    });
    createdProducts.push(product);
  }

  // Related products
  if (createdProducts.length >= 3) {
    await prisma.productRelation.createMany({
      data: [
        {
          productId: createdProducts[0].id,
          relatedProductId: createdProducts[1].id,
        },
        {
          productId: createdProducts[0].id,
          relatedProductId: createdProducts[2].id,
        },
      ],
    });
  }

  const classicCollection = await prisma.collection.create({
    data: {
      title: "مجموعة كلاسيك",
      slug: "classic",
      image: PLACEHOLDER("1615634208120-6b972854b826"),
      imageAlt: "مجموعة كلاسيك",
      sortOrder: 1,
      products: {
        create: createdProducts.slice(0, 4).map((p, i) => ({
          productId: p.id,
          sortOrder: i,
        })),
      },
    },
  });

  const watchesCollection = await prisma.collection.create({
    data: {
      title: "مجموعة الساعات",
      slug: "watches",
      image: PLACEHOLDER("1523275335684-37898b6baf30"),
      imageAlt: "مجموعة الساعات",
      sortOrder: 2,
      products: {
        create: createdProducts
          .filter((p) => p.slug.includes("watch") || p.slug === "nebula-gold")
          .map((p, i) => ({ productId: p.id, sortOrder: i })),
      },
    },
  });

  await prisma.homeContent.create({
    data: {
      id: 1,
      hero: {
        image: PLACEHOLDER("1615634208120-6b972854b826"),
        imageAlt: "ترف — فخامة عربية",
        title: "ترف — حيث تلتقي الفخامة بالأصالة",
        subtitle: "اكتشف مجموعتنا الحصرية من عطور وإكسسوارات فاخرة",
        ctaPrimary: { label: "تسوق الآن", href: "/collections" },
        ctaSecondary: { label: "استكشف المجموعات", href: "/collections" },
      },
      bentoItems: [
        {
          id: "bento-1",
          productSlug: "royal-edition",
          title: "الإصدار الملكي",
          subtitle: "عطور",
          image: PLACEHOLDER("1615634208120-6b972854b826"),
          imageAlt: "الإصدار الملكي",
          span: "2",
        },
        {
          id: "bento-2",
          productSlug: "nebula-gold",
          title: "السديم المذهب",
          image: PLACEHOLDER("1523275335684-37898b6baf30"),
          imageAlt: "ساعة السديم",
          span: "1",
        },
      ],
      featuredCollectionIds: [classicCollection.id, watchesCollection.id],
      features: [
        { title: "شحن مجاني", description: "داخل المملكة العربية السعودية" },
        { title: "ضمان أصالة", description: "100% منتجات أصلية" },
        { title: "VIP", description: "برنامج ولاء حصري" },
      ],
      newsletterEnabled: true,
    },
  });

  await prisma.cart.create({
    data: { userId: customer.id },
  });

  console.log("Seed complete");
  console.log(`Admin: ${admin.email} / Password123!`);
  console.log(`Customer: ${customer.email} / Password123!`);
  console.log(`Products: ${createdProducts.length}`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
